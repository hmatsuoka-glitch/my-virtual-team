#!/bin/bash
#
# auto-commit.sh
#
# my-virtual-team の Daily Knowledge Log 自動コミット & プッシュスクリプト
# launchd から朝8:00（またはMac起床時）に起動される
#
# 動作:
#   1. Cowork タスクが進行中なら待機（ファイル更新が落ち着くまで）
#   2. .git/index.lock を必要に応じて削除
#   3. agents/ と CHANGELOG-AGENTS.md の変更を git add
#   4. 変更があればコミット
#   5. リモート（origin/main）に未push分があれば git push（認証は macOS keychain / gh CLI / SSH に依存）
#   6. 結果をログに記録
#

set -uo pipefail

REPO_DIR="${HOME}/my-virtual-team"
LOG_DIR="${REPO_DIR}/logs"
LOG_FILE="${LOG_DIR}/auto-commit.log"
DATE_STR=$(date +%Y-%m-%d)
TIMESTAMP=$(date +'%Y-%m-%d %H:%M:%S')

mkdir -p "${LOG_DIR}"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log "=== auto-commit start (${DATE_STR}) ==="

# 1. リポジトリディレクトリへ移動
cd "${REPO_DIR}" || {
    log "ERROR: cannot cd to ${REPO_DIR}"
    exit 1
}

# 2. Git リポジトリか確認
if [ ! -d ".git" ]; then
    log "WARN: ${REPO_DIR} is not a git repository, skipping"
    exit 0
fi

# --- push 共通関数（多重定義） ----------------------------------
push_to_remote() {
    # 引数なし。origin/main へ未push分があれば push する。
    # 認証は macOS keychain / gh CLI / SSH 経由（このスクリプトが macOS 上で動作する前提）
    local upstream
    upstream=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || echo "")
    if [ -z "${upstream}" ]; then
        log "INFO: no upstream tracking branch, skipping push"
        return 0
    fi

    local ahead
    ahead=$(git rev-list --count "${upstream}..HEAD" 2>/dev/null || echo "0")
    if [ "${ahead}" = "0" ]; then
        log "INFO: nothing to push (in sync with ${upstream})"
        return 0
    fi

    log "INFO: pushing ${ahead} commit(s) to ${upstream}..."
    if git push origin HEAD 2>>"${LOG_FILE}"; then
        log "OK: push succeeded (${ahead} commit(s) → ${upstream})"
        return 0
    else
        log "ERROR: git push failed (check auth: gh auth status / keychain / SSH)"
        return 1
    fi
}
# ---------------------------------------------------------------

# 3. 既に本日コミット済みかチェック（朝一回の冪等性確保）
TODAY_COMMIT=$(git log --since="${DATE_STR} 00:00" --grep="daily knowledge log ${DATE_STR}" --format="%H" | head -1)
if [ -n "${TODAY_COMMIT}" ]; then
    log "INFO: today's commit already exists (${TODAY_COMMIT:0:8}), skipping commit"
    # 既にコミット済みでも未push分があれば push する
    push_to_remote || true
    log "=== auto-commit done (already-done) ==="
    exit 0
fi

# 4. Cowork タスクの完了待機（ファイル活動の沈静化を待つ）
log "INFO: waiting for Cowork file activity to settle..."
WAIT_TIMEOUT=900  # 15分上限
WAIT_START=$(date +%s)
SETTLE_DURATION=120  # 2分間ファイル変更がなければ「沈静化」と判定

while true; do
    NOW=$(date +%s)
    ELAPSED=$((NOW - WAIT_START))

    # タイムアウトチェック
    if [ "${ELAPSED}" -gt "${WAIT_TIMEOUT}" ]; then
        log "WARN: settle timeout after ${ELAPSED}s, proceeding anyway"
        break
    fi

    # 直近2分以内に変更されたファイルを探す
    RECENT_CHANGE=$(find ./agents -name "*.md" -type f -mmin -2 2>/dev/null | head -1)
    if [ -z "${RECENT_CHANGE}" ]; then
        # 直近2分間ファイル変更なし → 沈静化と判定
        log "INFO: file activity settled (no changes in last 2 min)"
        break
    fi

    log "INFO: still active (recent: ${RECENT_CHANGE}), waiting 30s..."
    sleep 30
done

# 5. index.lock があれば削除
if [ -f ".git/index.lock" ]; then
    LOCK_AGE=$(($(date +%s) - $(stat -f %m .git/index.lock 2>/dev/null || stat -c %Y .git/index.lock 2>/dev/null || echo 0)))
    if [ "${LOCK_AGE}" -gt 60 ]; then
        log "INFO: stale lock detected (age: ${LOCK_AGE}s), removing"
        rm -f .git/index.lock
    else
        log "WARN: fresh lock detected (age: ${LOCK_AGE}s), waiting 30s and retry"
        sleep 30
        if [ -f ".git/index.lock" ]; then
            log "INFO: removing lock after wait"
            rm -f .git/index.lock
        fi
    fi
fi

# 6. 変更があるか確認
if git diff --quiet && git diff --staged --quiet && [ -z "$(git status --porcelain)" ]; then
    log "INFO: no changes to commit"
    # 変更が無くても未push分があれば push する
    push_to_remote || true
    log "=== auto-commit done (no-op) ==="
    exit 0
fi

# 7. 変更を add
git add CHANGELOG-AGENTS.md agents/ 2>>"${LOG_FILE}" || {
    log "ERROR: git add failed"
    exit 2
}

# 8. テーマ取得（CHANGELOG-AGENTS.md から本日のテーマを抽出）
THEME=$(grep -A1 "## ${DATE_STR}" CHANGELOG-AGENTS.md 2>/dev/null | \
        grep -E "^\*\*|本日のテーマ" | head -1 | \
        sed -E 's/.*\*\*([^（]+).*/\1/' | tr -d '*' || echo "daily-update")
[ -z "${THEME}" ] && THEME="daily-update"

# 9. コミット
COMMIT_MSG="chore(agents): daily knowledge log ${DATE_STR} - ${THEME}"
if git diff --staged --quiet; then
    log "INFO: nothing staged, skipping commit"
else
    git commit -m "${COMMIT_MSG}" 2>>"${LOG_FILE}" && \
        log "OK: committed: ${COMMIT_MSG}" || \
        { log "ERROR: git commit failed"; exit 3; }
fi

# 10. コミット後の push（失敗してもスクリプト自体は成功扱い：次回 launchd でリトライ）
push_to_remote || true

log "=== auto-commit done ==="
exit 0
