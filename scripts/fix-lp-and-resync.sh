#!/bin/bash
#
# fix-lp-and-resync.sh
#
# 前回 migrate-eiji-agents.sh で失敗した LP部関連の統合を修復する。
#
# 実施内容:
#   1. migrate-lp-dept.sh を実行（07-LP複製部 → 07-LP部 改編、tsumugi/iro/kotone 追加）
#   2. LP部の既存メンバー（ren/nao/sota/hana/mia）に eijiyoshikawa 統合を補完
#   3. エージェント版の旧 07-LP複製部 ディレクトリを削除
#   4. README/AGENTS.md を再生成、スキル版へcommit&push、エージェント版へsync
#

set -uo pipefail

EIJI_DIR="${HOME}/eijiyoshikawa-agents/agents"
REPO_DIR="${HOME}/my-virtual-team"
LOG_FILE="${REPO_DIR}/logs/fix-lp.log"
BUILDER="${REPO_DIR}/scripts/build-from-eiji.py"

mkdir -p "$(dirname "${LOG_FILE}")"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC}  $1" | tee -a "${LOG_FILE}"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1" | tee -a "${LOG_FILE}"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1" | tee -a "${LOG_FILE}"; }
err()   { echo -e "${RED}[ERROR]${NC} $1" | tee -a "${LOG_FILE}"; }

info "=== fix-lp-and-resync start ($(date +'%Y-%m-%d %H:%M:%S')) ==="

cd "${REPO_DIR}" || { err "cd 失敗"; exit 1; }

# ============================================================
# STEP 1: migrate-lp-dept.sh を実行（LP部改編）
# ============================================================
info "STEP 1: LP部改編（migrate-lp-dept.sh）を実行"

if [ -d "agents/07-LP部" ] && [ ! -d "agents/07-LP複製部" ]; then
    warn "既に LP部改編済み。スキップ"
else
    bash "${REPO_DIR}/scripts/migrate-lp-dept.sh" 2>&1 | tee -a "${LOG_FILE}" || {
        err "migrate-lp-dept.sh が失敗"
        exit 2
    }
fi

ok "LP部改編完了（07-LP部 として確立）"

# ============================================================
# STEP 2: LP部メンバーへの eijiyoshikawa 統合を補完
# ============================================================
info "STEP 2: LP部メンバーへの eijiyoshikawa 統合を補完"

# ren ← engineer, web_builder/builder
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/engineer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/ren.md" \
    --source-name "engineer" 2>&1 | tee -a "${LOG_FILE}"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/builder/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/ren.md" \
    --source-name "web_builder_builder" 2>&1 | tee -a "${LOG_FILE}"

# nao(LP) ← ui_ux_designer, web_builder/structure_analyzer
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/ui_ux_designer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/nao.md" \
    --source-name "ui_ux_designer" 2>&1 | tee -a "${LOG_FILE}"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/structure_analyzer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/nao.md" \
    --source-name "web_builder_structure_analyzer" 2>&1 | tee -a "${LOG_FILE}"

# sota ← web_builder/motion_analyzer, interaction_analyzer
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/motion_analyzer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/sota.md" \
    --source-name "web_builder_motion_analyzer" 2>&1 | tee -a "${LOG_FILE}"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/interaction_analyzer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/sota.md" \
    --source-name "web_builder_interaction_analyzer" 2>&1 | tee -a "${LOG_FILE}"

# hana ← web_builder/site_scanner, design_analyzer, asset_collector
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/site_scanner/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/hana.md" \
    --source-name "web_builder_site_scanner" 2>&1 | tee -a "${LOG_FILE}"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/design_analyzer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/hana.md" \
    --source-name "web_builder_design_analyzer" 2>&1 | tee -a "${LOG_FILE}"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/asset_collector/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/hana.md" \
    --source-name "web_builder_asset_collector" 2>&1 | tee -a "${LOG_FILE}"

# mia ← web_builder/qa_reviewer
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/qa_reviewer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/mia.md" \
    --source-name "web_builder_qa_reviewer" 2>&1 | tee -a "${LOG_FILE}"

ok "LP部メンバーへの統合補完完了"

# ============================================================
# STEP 3: エージェント版の旧 07-LP複製部 ディレクトリを削除
# ============================================================
info "STEP 3: エージェント版の旧 07-LP複製部 を削除"

AGENTS_REPO="${HOME}/my-virtual-team-agents"
OLD_AGENTS_DIR="${AGENTS_REPO}/.claude/agents/07-LP複製部"

if [ -d "${OLD_AGENTS_DIR}" ]; then
    rm -rf "${OLD_AGENTS_DIR}"
    ok "エージェント版の旧ディレクトリを削除"
else
    warn "エージェント版の旧ディレクトリは既にない"
fi

# ============================================================
# STEP 4: README/AGENTS.md 再生成
# ============================================================
info "STEP 4: README/AGENTS.md 再生成"

python3 "${REPO_DIR}/scripts/sync-source-readmes.py" "${REPO_DIR}" 2>&1 | tee -a "${LOG_FILE}"

# ============================================================
# STEP 5: スキル版へ commit & push
# ============================================================
info "STEP 5: スキル版へ commit & push"

cd "${REPO_DIR}"
git add -A 2>>"${LOG_FILE}"

if git diff --staged --quiet; then
    warn "ステージ済み変更なし"
else
    git commit -m "fix(team): complete LP部改編 + LP部メンバーへのeijiyoshikawa統合補完" 2>>"${LOG_FILE}" && \
        ok "commit 完了" || warn "commit 失敗"

    git push origin main 2>>"${LOG_FILE}" && \
        ok "push 完了" || warn "push 失敗"
fi

# ============================================================
# STEP 6: エージェント版へ同期
# ============================================================
info "STEP 6: エージェント版へ同期"

bash "${REPO_DIR}/scripts/sync-to-agents.sh" 2>&1 | tee -a "${LOG_FILE}" || \
    warn "sync-to-agents.sh が一部失敗"

ok "=========================================="
ok " 修復完了！"
ok "=========================================="
info "確認:"
info "  スキル版:       https://github.com/hmatsuoka-glitch/my-virtual-team"
info "  エージェント版: https://github.com/hmatsuoka-glitch/my-virtual-team-agents"

ok "=== fix-lp-and-resync done ($(date +'%Y-%m-%d %H:%M:%S')) ==="
exit 0
