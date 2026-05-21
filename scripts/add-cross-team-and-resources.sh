#!/bin/bash
#
# add-cross-team-and-resources.sh
#
# eijiyoshikawa/agents から以下を追加で取り込む：
#   1. 17-横断チーム部署を新設（pm / qa / kpi / dat の4エージェント）
#   2. 戦略提案パイプライン定義（orchestrator/）を取り込み
#   3. デザインシステム（design-md/）を取り込み
#   4. 建設業AI事例集（construction-ai-cases/）を取り込み
#

set -uo pipefail

EIJI_DIR="${HOME}/eijiyoshikawa-agents"
REPO_DIR="${HOME}/my-virtual-team"
LOG_FILE="${REPO_DIR}/logs/add-cross-team.log"
BUILDER="${REPO_DIR}/scripts/build-from-eiji.py"
DATE_STR=$(date +%Y-%m-%d)

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

info "=== 横断チーム新設 + 追加リソース取り込み start ($(date +'%Y-%m-%d %H:%M:%S')) ==="

cd "${REPO_DIR}" || { err "cd 失敗"; exit 1; }

# ============================================================
# STEP 1: 17-横断チーム部署の新設
# ============================================================
info "STEP 1: 17-横断チーム部署を作成し、4エージェントを追加"

mkdir -p "${REPO_DIR}/agents/17-横断チーム"

# pm（横断PM、既存kaiは「システム開発PM特化」と差別化）
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/agents/project_manager/prompt.md" \
    --dst "${REPO_DIR}/agents/17-横断チーム/pm.md" \
    --name "Pm" --dept "17-横断チーム" \
    --role "横断プロジェクトマネージャー" \
    --specialty "全社横断のプロジェクト進捗・リソース配分・納期管理（kai はシステム開発PM特化、こちらは全部署横断）"

# qa（横断QAレビュアー、既存soraは「COO最終QA」と差別化）
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/agents/qa_reviewer/prompt.md" \
    --dst "${REPO_DIR}/agents/17-横断チーム/qa.md" \
    --name "Qa" --dept "17-横断チーム" \
    --role "横断QAレビュアー" \
    --specialty "全エージェント出力の品質検証・相互整合性チェック・スキーマ検証（sora は COO 最終QA、こちらは中間QA・整合性チェック特化）"

# kpi（横断KPIダッシュボード、既存shunは「採用データ特化」と差別化）
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/agents/kpi_dashboard/prompt.md" \
    --dst "${REPO_DIR}/agents/17-横断チーム/kpi.md" \
    --name "Kpi" --dept "17-横断チーム" \
    --role "横断KPIダッシュボードマネージャー" \
    --specialty "全社KPI集計・異常検知・日次/週次/月次レポーティング・経営ダッシュボード（shun は採用KPI特化、こちらは全社KPI俯瞰）"

# dat（横断データアナリスト、既存shunは「採用データ特化」と差別化）
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/agents/data_analyst/prompt.md" \
    --dst "${REPO_DIR}/agents/17-横断チーム/dat.md" \
    --name "Dat" --dept "17-横断チーム" \
    --role "横断データアナリスト" \
    --specialty "横断データ分析・インサイト抽出・意思決定支援・統計分析（shun は採用×SNS分析特化、こちらは全社横断データ分析）"

ok "17-横断チーム 4エージェント作成完了"

# ============================================================
# STEP 2: 戦略提案パイプライン定義の取り込み
# ============================================================
info "STEP 2: 戦略提案パイプライン定義（orchestrator/）取り込み"

mkdir -p "${REPO_DIR}/orchestrator"
cp "${EIJI_DIR}/agents/orchestrator/PIPELINE.md" "${REPO_DIR}/orchestrator/PIPELINE.md"
cp "${EIJI_DIR}/agents/orchestrator/run.md" "${REPO_DIR}/orchestrator/run.md"

# my-virtual-team 用にエージェント名のマッピングを README に明記
cat > "${REPO_DIR}/orchestrator/README.md" <<'EOF'
# Strategy Proposal Pipeline — 戦略提案パイプライン

eijiyoshikawa/agents から取り込んだ「戦略提案パイプライン」の実行手順です。

## my-virtual-team でのエージェントマッピング

eijiyoshikawa の元エージェント名 → my-virtual-team の該当エージェント:

| eijiyoshikawa | my-virtual-team | 役割 |
| --- | --- | --- |
| retriever | `agents/01-経営企画部/retri.md` | 議事録取得・構造化 |
| issue_structurer | `agents/01-経営企画部/sutu.md` | 課題言語化・構造化 |
| market_researcher | `agents/06-リサーチ部/rui.md` | 市場・競合・顧客分析 |
| analogy_finder | `agents/06-リサーチ部/ana.md` | 異業種アナロジー事例 |
| marketing_analyst | `agents/02-SNS運用部/yui.md` | マーケ施策深掘り分析 |
| strategist | `agents/01-経営企画部/haruto.md` | 戦略構築 |
| devils_advocate | `agents/00-COO/deva.md` | 批判的検証 |
| report_builder | `agents/10-資料作成部/yuto.md` | Google Slides提案資料 |
| document_builder | `agents/10-資料作成部/yuto.md` | 対話型提案資料 |
| qa_reviewer | `agents/17-横断チーム/qa.md` または `agents/00-COO/sora.md` | 品質検証 |

## 実行方法

1. `PIPELINE.md` を Read で読み込む
2. 各 STEP で指定されたエージェントを上記マッピング表で対応エージェントに置き換えて起動
3. `run.md` の手順に従って段階実行

## 関連ファイル

- [PIPELINE.md](./PIPELINE.md) — パイプラインの詳細手順
- [run.md](./run.md) — ワンショット実行プロンプト
EOF

ok "戦略提案パイプライン取り込み完了"

# ============================================================
# STEP 3: design-md（55社デザインシステム）取り込み
# ============================================================
info "STEP 3: design-md/ 取り込み（55社デザインシステム）"

if [ -d "${REPO_DIR}/design-md" ]; then
    warn "design-md/ は既に存在します。新規分のみ追加コピー"
fi

cp -R "${EIJI_DIR}/design-md" "${REPO_DIR}/design-md" 2>&1 | tee -a "${LOG_FILE}" || warn "コピーで一部警告"

DESIGN_COUNT=$(ls -1 "${REPO_DIR}/design-md/" 2>/dev/null | grep -v "README.md" | wc -l | tr -d ' ')
ok "design-md/ 取り込み完了（${DESIGN_COUNT} 社分のデザインシステム）"

# ============================================================
# STEP 4: construction-ai-cases 取り込み
# ============================================================
info "STEP 4: construction-ai-cases/ 取り込み（建設AI事例集 Next.js プロジェクト）"

if [ -d "${REPO_DIR}/construction-ai-cases" ]; then
    warn "construction-ai-cases/ は既に存在します。スキップ"
else
    # node_modules や .next は除外（あれば）
    rsync -av \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.DS_Store' \
        "${EIJI_DIR}/construction-ai-cases/" \
        "${REPO_DIR}/construction-ai-cases/" 2>&1 | tail -5 | tee -a "${LOG_FILE}"
fi

ok "construction-ai-cases/ 取り込み完了"

# ============================================================
# STEP 5: README/AGENTS.md 再生成
# ============================================================
info "STEP 5: README/AGENTS.md 再生成"

python3 "${REPO_DIR}/scripts/sync-source-readmes.py" "${REPO_DIR}" 2>&1 | tee -a "${LOG_FILE}"

ok "README/AGENTS.md 再生成完了"

# ============================================================
# STEP 6: スキル版へ commit & push
# ============================================================
info "STEP 6: スキル版へ commit & push"

cd "${REPO_DIR}"
git add -A 2>>"${LOG_FILE}"

if git diff --staged --quiet; then
    warn "ステージ済み変更なし"
else
    git commit -m "feat(team): add 17-横断チーム + orchestrator + design-md(55社) + construction-ai-cases" 2>>"${LOG_FILE}" && \
        ok "commit 完了" || warn "commit 失敗"

    git push origin main 2>>"${LOG_FILE}" && \
        ok "push 完了" || warn "push 失敗"
fi

# ============================================================
# STEP 7: エージェント版へ同期
# ============================================================
info "STEP 7: エージェント版へ同期"

bash "${REPO_DIR}/scripts/sync-to-agents.sh" 2>&1 | tee -a "${LOG_FILE}" || \
    warn "sync-to-agents.sh が一部失敗"

ok "=========================================="
ok " 追加リソース取り込み 完了！"
ok "=========================================="
info ""
info "新規追加:"
info "  - 17-横断チーム: pm / qa / kpi / dat（4エージェント）"
info "  - orchestrator/ : 戦略提案パイプライン定義"
info "  - design-md/ : 55社のデザインシステム"
info "  - construction-ai-cases/ : 建設業AI事例集"
info ""
info "確認:"
info "  スキル版:       https://github.com/hmatsuoka-glitch/my-virtual-team"
info "  エージェント版: https://github.com/hmatsuoka-glitch/my-virtual-team-agents"

ok "=== add-cross-team-and-resources done ($(date +'%Y-%m-%d %H:%M:%S')) ==="
exit 0
