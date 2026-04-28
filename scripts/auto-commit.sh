#!/bin/bash
#
# auto-commit.sh
#
# my-virtual-team の Daily Knowledge Log 自動コミットスクリプト
# launchd から毎日 04:30 AM に起動される
#
# 動作:
#   1. .git/index.lock を強制削除（サンドボックス外なので可能）
#   2. agents/ と CHANGELOG-AGENTS.md の変更を git add
#   3. 変更があればコミット（push はしない）
#   4. 結果をログに記録
#

set -uo pipefail

REPO_DIR="${HOME}/my-virtual-team"
LOG_DIR="${REPO_DIR}/logs"
LOG_FILE="${LOG_DIR}/auto-commit.log"
DATE_STR=$(date +%Y-%m-%d)
TIMESTAMP=$(date +'%Y-%m-%d %H:%M:%S')

mkdir -p "${LOG_DIR}"

log() {
    echo "[${TIMESTAMP}] $1" | tee -a "${LOG_FILE}"
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

# 3. index.lock があれば削除
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

# 4. 変更があるか確認
if git diff --quiet && git diff --staged --quiet && [ -z "$(git status --porcelain)" ]; then
    log "INFO: no changes to commit"
    log "=== auto-commit done (no-op) ==="
    exit 0
fi

# 5. 変更を add
git add CHANGELOG-AGENTS.md agents/ 2>>"${LOG_FILE}" || {
    log "ERROR: git add failed"
    exit 2
}

# 6. テーマ取得（CHANGELOG-AGENTS.md から本日のテーマを抽出）
THEME=$(grep -A1 "## ${DATE_STR}" CHANGELOG-AGENTS.md 2>/dev/null | \
        grep -E "^\*\*|本日のテーマ" | head -1 | \
        sed -E 's/.*\*\*([^（]+).*/\1/' | tr -d '*' || echo "daily-update")
[ -z "${THEME}" ] && THEME="daily-update"

# 7. コミット
COMMIT_MSG="chore(agents): daily knowledge log ${DATE_STR} - ${THEME}"
if git diff --staged --quiet; then
    log "INFO: nothing staged, skipping commit"
else
    git commit -m "${COMMIT_MSG}" 2>>"${LOG_FILE}" && \
        log "OK: committed: ${COMMIT_MSG}" || \
        { log "ERROR: git commit failed"; exit 3; }
fi

log "=== auto-commit done ==="
exit 0
