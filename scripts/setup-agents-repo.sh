#!/bin/bash
#
# setup-agents-repo.sh
#
# ワンショット実行スクリプト。以下を順に実施する：
#
# 1. ~/my-virtual-team の積み残し（未コミット変更）を commit & push
# 2. ~/my-virtual-team-agents/ を新規作成
# 3. agents/**/*.md を .claude/agents/**/*.md に変換（YAML frontmatter 付与）
# 4. README / AGENTS.md / CLAUDE.md を配置
# 5. git init + initial commit
# 6. gh repo create my-virtual-team-agents --public --source=. --push
# 7. auto-commit.sh を改造して sync-to-agents.sh を呼ぶように
#
# 前提:
# - gh CLI が認証済み（gh auth status で OK が出る状態）
# - python3 がインストール済み
#
# 使い方:
#   bash ~/my-virtual-team/scripts/setup-agents-repo.sh
#

set -uo pipefail

SOURCE_DIR="${HOME}/my-virtual-team"
AGENTS_REPO_DIR="${HOME}/my-virtual-team-agents"
GH_REPO_NAME="my-virtual-team-agents"
TPL_DIR="${SOURCE_DIR}/scripts/agents-repo-templates"
LOG_DIR="${SOURCE_DIR}/logs"
LOG_FILE="${LOG_DIR}/setup-agents-repo.log"

mkdir -p "${LOG_DIR}"

# === 色付き出力 ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC}    $1" | tee -a "${LOG_FILE}"; }
ok()      { echo -e "${GREEN}[OK]${NC}      $1" | tee -a "${LOG_FILE}"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}    $1" | tee -a "${LOG_FILE}"; }
err()     { echo -e "${RED}[ERROR]${NC}   $1" | tee -a "${LOG_FILE}"; }

info "=== setup-agents-repo start ($(date +'%Y-%m-%d %H:%M:%S')) ==="

# ---------------------------------------------------------------
# 前提チェック
# ---------------------------------------------------------------
if ! command -v gh >/dev/null 2>&1; then
    err "gh CLI が見つかりません。先に 'brew install gh && gh auth login' を実行してください"
    exit 1
fi
if ! command -v python3 >/dev/null 2>&1; then
    err "python3 が見つかりません。Homebrew または Xcode CLT で入れてください"
    exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
    err "gh CLI が未認証。'gh auth login' を実行してください"
    exit 1
fi
ok "前提チェック通過 (gh, python3, gh-auth)"

# ---------------------------------------------------------------
# STEP 1: ~/my-virtual-team の積み残しを反映
# ---------------------------------------------------------------
info "STEP 1: ~/my-virtual-team の積み残しを反映"
cd "${SOURCE_DIR}"

# index.lock 残骸を除去
if [ -f ".git/index.lock" ]; then
    info "stale .git/index.lock を除去"
    rm -f .git/index.lock
fi

if [ -n "$(git status --porcelain)" ]; then
    info "未コミット変更あり → push-now.sh を実行"
    bash "${SOURCE_DIR}/scripts/push-now.sh" 2>&1 | tee -a "${LOG_FILE}" || {
        err "push-now.sh 失敗。手動で確認してください"
        exit 2
    }
    ok "積み残しを反映完了"
else
    # 未push分のみあれば push
    UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || echo "")
    if [ -n "${UPSTREAM}" ]; then
        AHEAD=$(git rev-list --count "${UPSTREAM}..HEAD" 2>/dev/null || echo "0")
        if [ "${AHEAD}" != "0" ]; then
            info "未push commit (${AHEAD}件) → push"
            git push origin HEAD 2>&1 | tee -a "${LOG_FILE}" || warn "push失敗 (続行)"
        fi
    fi
    ok "積み残しなし"
fi

# ---------------------------------------------------------------
# STEP 2: ~/my-virtual-team-agents/ を新規作成
# ---------------------------------------------------------------
info "STEP 2: ${AGENTS_REPO_DIR} を新規作成"

if [ -d "${AGENTS_REPO_DIR}" ]; then
    warn "既に ${AGENTS_REPO_DIR} が存在します。中断します"
    warn "再構築する場合は: rm -rf ${AGENTS_REPO_DIR} を先に実行してください"
    exit 3
fi

mkdir -p "${AGENTS_REPO_DIR}"
ok "ディレクトリ作成: ${AGENTS_REPO_DIR}"

# ---------------------------------------------------------------
# STEP 3: テンプレートファイル配置
# ---------------------------------------------------------------
info "STEP 3: テンプレートファイル配置 (README / CLAUDE / .gitignore)"

cp "${TPL_DIR}/README.md" "${AGENTS_REPO_DIR}/README.md"
cp "${TPL_DIR}/CLAUDE.md" "${AGENTS_REPO_DIR}/CLAUDE.md"
cp "${TPL_DIR}/.gitignore" "${AGENTS_REPO_DIR}/.gitignore"

# LICENSE を継承
if [ -f "${SOURCE_DIR}/LICENSE" ]; then
    cp "${SOURCE_DIR}/LICENSE" "${AGENTS_REPO_DIR}/LICENSE"
fi

ok "テンプレート配置完了"

# ---------------------------------------------------------------
# STEP 4: agents/ → .claude/agents/ に変換
# ---------------------------------------------------------------
info "STEP 4: agents/ → .claude/agents/ に変換（frontmatter 付与）"

python3 "${SOURCE_DIR}/scripts/build-agents-repo.py" \
    "${SOURCE_DIR}/agents" \
    "${AGENTS_REPO_DIR}/.claude/agents" \
    --initial 2>&1 | tee -a "${LOG_FILE}" || {
        err "build-agents-repo.py 失敗"
        exit 4
    }

ok "エージェント変換完了"

# ---------------------------------------------------------------
# STEP 5: AGENTS.md 生成
# ---------------------------------------------------------------
info "STEP 5: AGENTS.md 自動生成"

python3 "${SOURCE_DIR}/scripts/build-agents-readme.py" \
    "${AGENTS_REPO_DIR}" 2>&1 | tee -a "${LOG_FILE}" || {
        err "build-agents-readme.py 失敗"
        exit 5
    }

ok "AGENTS.md 生成完了"

# ---------------------------------------------------------------
# STEP 6: git init + initial commit + gh repo create + push
# ---------------------------------------------------------------
info "STEP 6: git init + gh repo create + push"

cd "${AGENTS_REPO_DIR}"
git init -b main 2>&1 | tee -a "${LOG_FILE}"
git config user.email "h.matsuoka@let-inc.net"
git config user.name "ひでと"
git add -A
git commit -m "feat: initial mirror from my-virtual-team (subagent 形式)" 2>&1 | tee -a "${LOG_FILE}" || {
    err "initial commit 失敗"
    exit 6
}

ok "initial commit 完了"

# GH repo を作成（既存なら failure → エラーで停止）
info "GitHub に ${GH_REPO_NAME} を作成"
if gh repo view "${GH_REPO_NAME}" >/dev/null 2>&1; then
    warn "リモート '${GH_REPO_NAME}' は既に存在しています。push のみ実行します"
    GH_USER=$(gh api user --jq .login)
    git remote add origin "https://github.com/${GH_USER}/${GH_REPO_NAME}.git" 2>/dev/null || \
        git remote set-url origin "https://github.com/${GH_USER}/${GH_REPO_NAME}.git"
    git push -u origin main 2>&1 | tee -a "${LOG_FILE}" || {
        err "push 失敗"
        exit 7
    }
else
    gh repo create "${GH_REPO_NAME}" \
        --public \
        --description "LET バーチャルチーム（subagent 形式）- my-virtual-team から自動同期" \
        --source="." \
        --remote=origin \
        --push 2>&1 | tee -a "${LOG_FILE}" || {
            err "gh repo create 失敗"
            exit 7
        }
fi

ok "GitHub リポジトリ作成 + push 完了"

# ---------------------------------------------------------------
# STEP 7: auto-commit.sh を改造（sync-to-agents.sh の呼び出しを追加）
# ---------------------------------------------------------------
info "STEP 7: auto-commit.sh に sync-to-agents 呼び出しを追加"

AUTOCOMMIT_PATH="${SOURCE_DIR}/scripts/auto-commit.sh"

if grep -q "sync-to-agents.sh" "${AUTOCOMMIT_PATH}"; then
    ok "auto-commit.sh は既に sync-to-agents.sh を呼ぶようになっています"
else
    # 末尾の `exit 0` の直前に挿入
    python3 - <<PYEOF
import pathlib
p = pathlib.Path("${AUTOCOMMIT_PATH}")
src = p.read_text(encoding="utf-8")
insertion = '''
# ---------------------------------------------------------------
# 11. my-virtual-team-agents（subagent 版リポジトリ）に同期
# ---------------------------------------------------------------
if [ -x "\${REPO_DIR}/scripts/sync-to-agents.sh" ]; then
    log "INFO: sync-to-agents.sh 実行"
    bash "\${REPO_DIR}/scripts/sync-to-agents.sh" >> "\${LOG_FILE}" 2>&1 || log "WARN: sync-to-agents.sh が失敗（続行）"
fi

'''
# 最後の "log "=== auto-commit done ===""の前に挿入
marker = 'log "=== auto-commit done ==="'
if marker in src and 'sync-to-agents.sh' not in src:
    # 最後の出現箇所を探す
    idx = src.rfind(marker)
    new_src = src[:idx] + insertion + src[idx:]
    p.write_text(new_src, encoding="utf-8")
    print("auto-commit.sh 更新完了")
else:
    print("マーカーが見つからない or 既に修正済み。手動確認推奨")
PYEOF

    ok "auto-commit.sh 更新完了"
fi

# sync-to-agents.sh に実行権限を付与
chmod +x "${SOURCE_DIR}/scripts/sync-to-agents.sh"
chmod +x "${SOURCE_DIR}/scripts/setup-agents-repo.sh"
ok "スクリプトに実行権限付与"

# ---------------------------------------------------------------
# 完了
# ---------------------------------------------------------------
echo
ok "=========================================="
ok " セットアップ完了！"
ok "=========================================="
echo
info "確認:"
info "  - スキル版:     https://github.com/$(gh api user --jq .login)/my-virtual-team"
info "  - エージェント版: https://github.com/$(gh api user --jq .login)/${GH_REPO_NAME}"
echo
info "次回以降の自動運用:"
info "  毎朝 auto-commit.sh が両方のリポジトリに反映します"
echo
info "手動で同期したい場合:"
info "  bash ${SOURCE_DIR}/scripts/sync-to-agents.sh"
echo
ok "=== setup-agents-repo done ($(date +'%Y-%m-%d %H:%M:%S')) ==="

exit 0
