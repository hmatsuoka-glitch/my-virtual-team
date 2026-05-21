#!/bin/bash
#
# sync-to-agents.sh
#
# ~/my-virtual-team の最新内容を ~/my-virtual-team-agents（subagent 版）に同期する。
#
# 1. build-agents-repo.py で .claude/agents/ 配下を再構築（frontmatter 維持つき）
# 2. build-agents-readme.py で AGENTS.md を再生成
# 3. 変更があれば commit & push
#
# auto-commit.sh から呼び出される。単体実行も可。
#

set -uo pipefail

SOURCE_DIR="${HOME}/my-virtual-team"
AGENTS_REPO_DIR="${HOME}/my-virtual-team-agents"
LOG_FILE="${SOURCE_DIR}/logs/sync-to-agents.log"

mkdir -p "$(dirname "${LOG_FILE}")"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log "=== sync-to-agents start ==="

# 前提チェック
if [ ! -d "${SOURCE_DIR}/agents" ]; then
    log "ERROR: ${SOURCE_DIR}/agents が見つかりません"
    exit 1
fi

if [ ! -d "${AGENTS_REPO_DIR}/.git" ]; then
    log "WARN: ${AGENTS_REPO_DIR} は git リポジトリではありません。setup-agents-repo.sh を先に実行してください"
    exit 0
fi

# 1. 再構築
log "INFO: build-agents-repo.py 実行中..."
python3 "${SOURCE_DIR}/scripts/build-agents-repo.py" \
    "${SOURCE_DIR}/agents" \
    "${AGENTS_REPO_DIR}/.claude/agents" 2>>"${LOG_FILE}" || {
    log "ERROR: build-agents-repo.py 失敗"
    exit 2
}

log "INFO: build-agents-readme.py 実行中..."
python3 "${SOURCE_DIR}/scripts/build-agents-readme.py" \
    "${AGENTS_REPO_DIR}" 2>>"${LOG_FILE}" || {
    log "ERROR: build-agents-readme.py 失敗"
    exit 3
}

# 2. git 操作
cd "${AGENTS_REPO_DIR}" || {
    log "ERROR: cd 失敗"
    exit 4
}

if [ -f ".git/index.lock" ]; then
    LOCK_AGE=$(($(date +%s) - $(stat -f %m .git/index.lock 2>/dev/null || stat -c %Y .git/index.lock 2>/dev/null || echo 0)))
    if [ "${LOCK_AGE}" -gt 60 ]; then
        log "INFO: stale lock 削除 (age: ${LOCK_AGE}s)"
        rm -f .git/index.lock
    fi
fi

if git diff --quiet && git diff --staged --quiet && [ -z "$(git status --porcelain)" ]; then
    log "INFO: 差分なし。終了"
    log "=== sync-to-agents done (no-op) ==="
    exit 0
fi

DATE_STR=$(date +%Y-%m-%d)
git add -A 2>>"${LOG_FILE}" || {
    log "ERROR: git add 失敗"
    exit 5
}

COMMIT_MSG="chore(sync): mirror from my-virtual-team ${DATE_STR}"
if git diff --staged --quiet; then
    log "INFO: ステージ済み変更なし"
else
    git commit -m "${COMMIT_MSG}" 2>>"${LOG_FILE}" && \
        log "OK: commit成功: ${COMMIT_MSG}" || {
            log "ERROR: commit失敗"
            exit 6
        }
fi

# 3. push
UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || echo "")
if [ -z "${UPSTREAM}" ]; then
    log "WARN: upstream 未設定。push スキップ"
    exit 0
fi

if git push origin HEAD 2>>"${LOG_FILE}"; then
    log "OK: push成功 (${UPSTREAM})"
else
    log "ERROR: push失敗"
    exit 7
fi

log "=== sync-to-agents done ==="
exit 0
