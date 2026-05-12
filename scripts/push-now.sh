#!/bin/bash
#
# push-now.sh
#
# 現在の未コミット変更 + 未プッシュコミットを一気に origin/main へ反映する一回限りのスクリプト。
# 通常運用では auto-commit.sh（launchd 経由）が自動でコミット & プッシュするので、
# このスクリプトは初回セットアップや積み残しクリア用に限る。
#
# 動作:
#   1. .git/index.lock の残骸を必要に応じて削除
#   2. 未コミット変更があれば一括コミット（メッセージは「manual sync」）
#   3. origin/main へ push
#
# 認証は macOS keychain / gh CLI / SSH 経由（事前に gh auth login など完了している前提）
#

set -uo pipefail

REPO_DIR="${HOME}/my-virtual-team"
LOG_DIR="${REPO_DIR}/logs"
LOG_FILE="${LOG_DIR}/push-now.log"
DATE_STR=$(date +%Y-%m-%d)

mkdir -p "${LOG_DIR}"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log "=== push-now start (${DATE_STR}) ==="

cd "${REPO_DIR}" || {
    log "ERROR: cannot cd to ${REPO_DIR}"
    exit 1
}

if [ ! -d ".git" ]; then
    log "ERROR: ${REPO_DIR} is not a git repository"
    exit 1
fi

# 1. stale lock の除去
if [ -f ".git/index.lock" ]; then
    log "INFO: removing stale .git/index.lock"
    rm -f .git/index.lock || log "WARN: failed to remove lock"
fi

# 2. 現在の状態をログに残す
log "INFO: current branch: $(git rev-parse --abbrev-ref HEAD)"
log "INFO: untracked + modified files: $(git status --porcelain | wc -l | tr -d ' ')"

UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || echo "")
if [ -n "${UPSTREAM}" ]; then
    AHEAD=$(git rev-list --count "${UPSTREAM}..HEAD" 2>/dev/null || echo "0")
    log "INFO: ahead of ${UPSTREAM} by ${AHEAD} commit(s)"
fi

# 3. 未コミット変更を一括コミット
if [ -n "$(git status --porcelain)" ]; then
    log "INFO: staging all changes (including untracked)..."
    git add -A 2>>"${LOG_FILE}" || {
        log "ERROR: git add failed"
        exit 2
    }

    COMMIT_MSG="chore(repo): manual sync ${DATE_STR} - push-now backlog"
    if git diff --staged --quiet; then
        log "INFO: nothing staged after add, skipping commit"
    else
        git commit -m "${COMMIT_MSG}" 2>>"${LOG_FILE}" && \
            log "OK: committed: ${COMMIT_MSG}" || \
            { log "ERROR: git commit failed"; exit 3; }
    fi
else
    log "INFO: no uncommitted changes"
fi

# 4. push
log "INFO: pushing to origin..."
if git push origin HEAD 2>>"${LOG_FILE}"; then
    log "OK: push succeeded"
else
    log "ERROR: git push failed (check: gh auth status / SSH keys / network)"
    exit 4
fi

log "=== push-now done ==="
exit 0
