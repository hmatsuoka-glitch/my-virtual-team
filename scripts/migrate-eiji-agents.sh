#!/bin/bash
#
# migrate-eiji-agents.sh
#
# eijiyoshikawa/agents の prompt.md を my-virtual-team に統合する一発実行スクリプト。
#
# 実施内容:
#   1. 新部署5つの作成（12-営業部 / 13-マーケティング部 / 14-経理財務部 / 15-人事部 / 16-業務自動化部）
#   2. 新規エージェント13体追加
#      - sales / marketing / pr / finance / hr
#      - bo_automation_specialist / order_workflow_designer
#      - retriever / issue_structurer / franchise_business_analyst
#      - analogy_finder / devils_advocate / data_engineer
#   3. 既存エージェントへの「追加能力」セクション統合（約20体）
#   4. README.md / AGENTS.md の自動再生成
#   5. スキル版リポジトリへ commit & push
#   6. エージェント版リポジトリへ同期
#
# 前提:
#   ~/eijiyoshikawa-agents が clone 済み
#

set -uo pipefail

EIJI_DIR="${HOME}/eijiyoshikawa-agents/agents"
REPO_DIR="${HOME}/my-virtual-team"
LOG_FILE="${REPO_DIR}/logs/migrate-eiji.log"
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

info "=== eijiyoshikawa 統合 start ($(date +'%Y-%m-%d %H:%M:%S')) ==="

# 前提チェック
if [ ! -d "${EIJI_DIR}" ]; then
    err "${EIJI_DIR} がありません。先に git clone してください"
    exit 1
fi
if [ ! -f "${BUILDER}" ]; then
    err "${BUILDER} がありません"
    exit 1
fi

cd "${REPO_DIR}" || { err "cd 失敗"; exit 1; }

# ============================================================
# STEP 1: 新部署5つの作成（ディレクトリだけ作成）
# ============================================================
info "STEP 1: 新部署ディレクトリの作成"

mkdir -p "${REPO_DIR}/agents/12-営業部"
mkdir -p "${REPO_DIR}/agents/13-マーケティング部"
mkdir -p "${REPO_DIR}/agents/14-経理財務部"
mkdir -p "${REPO_DIR}/agents/15-人事部"
mkdir -p "${REPO_DIR}/agents/16-業務自動化部"

ok "5新部署ディレクトリを作成"

# ============================================================
# STEP 2: 新規エージェント追加
# ============================================================
info "STEP 2: 新規エージェント13体の追加"

# 12-営業部
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/sales/prompt.md" \
    --dst "${REPO_DIR}/agents/12-営業部/sales.md" \
    --name "Sales" --dept "12-営業部" \
    --role "営業マネージャー" \
    --specialty "リード管理、商談パイプライン、受注管理、新規開拓"

# 13-マーケティング部
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/marketing/prompt.md" \
    --dst "${REPO_DIR}/agents/13-マーケティング部/marketing.md" \
    --name "Marketing" --dept "13-マーケティング部" \
    --role "マーケティングマネージャー" \
    --specialty "自社マーケティング・ブランディング・リード獲得・コンテンツ戦略"

python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/pr/prompt.md" \
    --dst "${REPO_DIR}/agents/13-マーケティング部/pr.md" \
    --name "Pr" --dept "13-マーケティング部" \
    --role "広報・PRマネージャー" \
    --specialty "プレスリリース、メディアリレーション、ブランド露出最大化、危機広報"

# 14-経理財務部
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/finance/prompt.md" \
    --dst "${REPO_DIR}/agents/14-経理財務部/finance.md" \
    --name "Finance" --dept "14-経理財務部" \
    --role "経理・財務マネージャー" \
    --specialty "経理・財務・見積・請求・PL管理・補助金申請・キャッシュフロー管理"

# 15-人事部
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/hr/prompt.md" \
    --dst "${REPO_DIR}/agents/15-人事部/hr.md" \
    --name "Hr" --dept "15-人事部" \
    --role "人事マネージャー" \
    --specialty "組織設計・採用・評価制度・社員エンゲージメント・エージェント組織管理"

# 16-業務自動化部
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/bo_automation_specialist/prompt.md" \
    --dst "${REPO_DIR}/agents/16-業務自動化部/bo.md" \
    --name "Bo" --dept "16-業務自動化部" \
    --role "業務自動化スペシャリスト" \
    --specialty "業界特化バックオフィスBPO自動化、定型業務のAI化、生産性向上"

python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/order_workflow_designer/prompt.md" \
    --dst "${REPO_DIR}/agents/16-業務自動化部/owl.md" \
    --name "Owl" --dept "16-業務自動化部" \
    --role "受注ワークフロー設計者" \
    --specialty "受注フローの設計・最適化・自動化、リードタイム短縮"

# 01-経営企画部 拡張
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/retriever/prompt.md" \
    --dst "${REPO_DIR}/agents/01-経営企画部/retri.md" \
    --name "Retri" --dept "01-経営企画部" \
    --role "議事録・資料リサーチャー" \
    --specialty "Notion議事録の取得・構造化、会議録の要点抽出、参考資料収集"

python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/issue_structurer/prompt.md" \
    --dst "${REPO_DIR}/agents/01-経営企画部/sutu.md" \
    --name "Sutu" --dept "01-経営企画部" \
    --role "イシューストラクチャラー" \
    --specialty "ビジネス課題の言語化・構造化、論点整理、イシュー分解"

python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/franchise_business_analyst/prompt.md" \
    --dst "${REPO_DIR}/agents/01-経営企画部/fuca.md" \
    --name "Fuca" --dept "01-経営企画部" \
    --role "FCビジネスアナリスト" \
    --specialty "フランチャイズ事業の収益モデル・契約設計・ロイヤリティ設計・加盟店戦略"

# 06-リサーチ部 拡張
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/analogy_finder/prompt.md" \
    --dst "${REPO_DIR}/agents/06-リサーチ部/ana.md" \
    --name "Ana" --dept "06-リサーチ部" \
    --role "アナロジー事例リサーチャー" \
    --specialty "異業種アナロジー事例の収集、ビジネス転用可能性の分析、抽象化思考"

# 00-COO 拡張
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/devils_advocate/prompt.md" \
    --dst "${REPO_DIR}/agents/00-COO/deva.md" \
    --name "Deva" --dept "00-COO" \
    --role "Devil's Advocate / 批判的検証担当" \
    --specialty "戦略・施策・成果物への批判的検証、反対意見の意図的提示、抜け穴指摘"

# 05-データ分析部 拡張
python3 "${BUILDER}" new \
    --src "${EIJI_DIR}/data_engineer/prompt.md" \
    --dst "${REPO_DIR}/agents/05-データ分析部/deng.md" \
    --name "Deng" --dept "05-データ分析部" \
    --role "データエンジニア" \
    --specialty "クローラー開発、データパイプライン構築、データ品質管理、ETL"

ok "新規13エージェント追加完了"

# ============================================================
# STEP 3: 既存エージェントへ「追加能力」セクションを統合
# ============================================================
info "STEP 3: 既存エージェントへの統合"

# 01-経営企画部/haruto ← strategist
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/strategist/prompt.md" \
    --dst "${REPO_DIR}/agents/01-経営企画部/haruto.md" \
    --source-name "strategist"

# 06-リサーチ部/rui ← market_researcher
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/market_researcher/prompt.md" \
    --dst "${REPO_DIR}/agents/06-リサーチ部/rui.md" \
    --source-name "market_researcher"

# 02-SNS運用部/yui ← marketing_analyst
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/marketing_analyst/prompt.md" \
    --dst "${REPO_DIR}/agents/02-SNS運用部/yui.md" \
    --source-name "marketing_analyst"

# 10-資料作成部/yuto ← report_builder, document_builder
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/report_builder/prompt.md" \
    --dst "${REPO_DIR}/agents/10-資料作成部/yuto.md" \
    --source-name "report_builder"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/document_builder/prompt.md" \
    --dst "${REPO_DIR}/agents/10-資料作成部/yuto.md" \
    --source-name "document_builder"

# 04-クライアント管理部/akari ← ad_operations
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/ad_operations/prompt.md" \
    --dst "${REPO_DIR}/agents/04-クライアント管理部/akari.md" \
    --source-name "ad_operations"

# 02-SNS運用部/sho ← sns_operator, content_creator
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/sns_operator/prompt.md" \
    --dst "${REPO_DIR}/agents/02-SNS運用部/sho.md" \
    --source-name "sns_operator"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/content_creator/prompt.md" \
    --dst "${REPO_DIR}/agents/02-SNS運用部/sho.md" \
    --source-name "content_creator"

# 04-クライアント管理部/ryota ← customer_success
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/customer_success/prompt.md" \
    --dst "${REPO_DIR}/agents/04-クライアント管理部/ryota.md" \
    --source-name "customer_success"

# 11-法務部/nori ← legal
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/legal/prompt.md" \
    --dst "${REPO_DIR}/agents/11-法務部/nori.md" \
    --source-name "legal"

# 09-システム開発部/kai ← tech_lead, project_manager
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/tech_lead/prompt.md" \
    --dst "${REPO_DIR}/agents/09-システム開発部/kai.md" \
    --source-name "tech_lead"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/project_manager/prompt.md" \
    --dst "${REPO_DIR}/agents/09-システム開発部/kai.md" \
    --source-name "project_manager"

# 09-システム開発部/ao ← backend_engineer
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/backend_engineer/prompt.md" \
    --dst "${REPO_DIR}/agents/09-システム開発部/ao.md" \
    --source-name "backend_engineer"

# 09-システム開発部/kuu ← infrastructure
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/infrastructure/prompt.md" \
    --dst "${REPO_DIR}/agents/09-システム開発部/kuu.md" \
    --source-name "infrastructure"

# 09-システム開発部/mio ← qa_engineer
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/qa_engineer/prompt.md" \
    --dst "${REPO_DIR}/agents/09-システム開発部/mio.md" \
    --source-name "qa_engineer"

# 09-システム開発部/riku ← frontend_engineer
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/frontend_engineer/prompt.md" \
    --dst "${REPO_DIR}/agents/09-システム開発部/riku.md" \
    --source-name "frontend_engineer"

# 07-LP部/ren ← engineer, web_builder/builder
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/engineer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/ren.md" \
    --source-name "engineer"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/builder/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/ren.md" \
    --source-name "web_builder_builder"

# 07-LP部/nao ← ui_ux_designer, web_builder/structure_analyzer
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/ui_ux_designer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/nao.md" \
    --source-name "ui_ux_designer"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/structure_analyzer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/nao.md" \
    --source-name "web_builder_structure_analyzer"

# 07-LP部/sota ← web_builder/motion_analyzer, interaction_analyzer
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/motion_analyzer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/sota.md" \
    --source-name "web_builder_motion_analyzer"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/interaction_analyzer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/sota.md" \
    --source-name "web_builder_interaction_analyzer"

# 07-LP部/hana ← web_builder/site_scanner, design_analyzer, asset_collector
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/site_scanner/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/hana.md" \
    --source-name "web_builder_site_scanner"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/design_analyzer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/hana.md" \
    --source-name "web_builder_design_analyzer"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/asset_collector/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/hana.md" \
    --source-name "web_builder_asset_collector"

# 07-LP部/mia ← web_builder/qa_reviewer
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/web_builder/qa_reviewer/prompt.md" \
    --dst "${REPO_DIR}/agents/07-LP部/mia.md" \
    --source-name "web_builder_qa_reviewer"

# 03-コンテンツ制作部/itsuki ← designer
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/designer/prompt.md" \
    --dst "${REPO_DIR}/agents/03-コンテンツ制作部/itsuki.md" \
    --source-name "designer"

# 08-バナー生成部/kana ← designer (シェア)
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/designer/prompt.md" \
    --dst "${REPO_DIR}/agents/08-バナー生成部/kana.md" \
    --source-name "designer"

# 05-データ分析部/shun ← data_analyst, kpi_dashboard
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/data_analyst/prompt.md" \
    --dst "${REPO_DIR}/agents/05-データ分析部/shun.md" \
    --source-name "data_analyst"

python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/kpi_dashboard/prompt.md" \
    --dst "${REPO_DIR}/agents/05-データ分析部/shun.md" \
    --source-name "kpi_dashboard"

# 00-COO/sora ← qa_reviewer
python3 "${BUILDER}" merge \
    --src "${EIJI_DIR}/qa_reviewer/prompt.md" \
    --dst "${REPO_DIR}/agents/00-COO/sora.md" \
    --source-name "qa_reviewer"

ok "既存統合完了"

# ============================================================
# STEP 4: README/AGENTS.md 自動再生成
# ============================================================
info "STEP 4: README/AGENTS.md 自動再生成"

python3 "${REPO_DIR}/scripts/sync-source-readmes.py" "${REPO_DIR}" 2>&1 | tee -a "${LOG_FILE}"

ok "README/AGENTS.md 再生成完了"

# ============================================================
# STEP 5: スキル版リポジトリへ commit & push
# ============================================================
info "STEP 5: スキル版リポジトリへ commit & push"

cd "${REPO_DIR}"
git add -A 2>>"${LOG_FILE}"

if git diff --staged --quiet; then
    warn "ステージ済み変更なし。スキップ"
else
    git commit -m "feat(team): integrate eijiyoshikawa/agents (新部署5+新規13体+既存統合)" 2>>"${LOG_FILE}" && \
        ok "commit 完了" || { err "commit 失敗"; exit 5; }

    git push origin main 2>>"${LOG_FILE}" && \
        ok "push 完了（スキル版）" || warn "push 失敗（auto-commit に任せる）"
fi

# ============================================================
# STEP 6: エージェント版リポジトリへ同期
# ============================================================
info "STEP 6: エージェント版リポジトリへ同期"

bash "${REPO_DIR}/scripts/sync-to-agents.sh" 2>&1 | tee -a "${LOG_FILE}" || \
    warn "sync-to-agents.sh が一部失敗"

ok "=========================================="
ok " eijiyoshikawa 統合 完了！"
ok "=========================================="
info "新規追加: 13エージェント"
info "  - 12-営業部: sales"
info "  - 13-マーケティング部: marketing, pr"
info "  - 14-経理財務部: finance"
info "  - 15-人事部: hr"
info "  - 16-業務自動化部: bo, owl"
info "  - 01-経営企画部: retri, sutu, fuca"
info "  - 06-リサーチ部: ana"
info "  - 00-COO: deva"
info "  - 05-データ分析部: deng"
info ""
info "既存統合: 約20エージェントに「追加能力」セクション追加"
info ""
info "確認:"
info "  スキル版:       https://github.com/hmatsuoka-glitch/my-virtual-team"
info "  エージェント版: https://github.com/hmatsuoka-glitch/my-virtual-team-agents"
ok "=== migrate-eiji-agents done ($(date +'%Y-%m-%d %H:%M:%S')) ==="

exit 0
