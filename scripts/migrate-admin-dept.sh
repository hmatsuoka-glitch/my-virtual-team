#!/bin/bash
#
# migrate-admin-dept.sh
#
# 11-法務部 / 14-経理財務部 / 15-人事部 を 「11-管理部門」 に集約。
# 16-業務自動化部 → 14-業務自動化部、17-横断チーム → 15-横断チーム にリナンバー。
# legal.md を新規追加。
#

set -uo pipefail

EIJI_DIR="${HOME}/eijiyoshikawa-agents/agents"
REPO_DIR="${HOME}/my-virtual-team"
LOG_FILE="${REPO_DIR}/logs/migrate-admin.log"
BUILDER="${REPO_DIR}/scripts/build-from-eiji.py"
AGENTS_REPO="${HOME}/my-virtual-team-agents"

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

info "=== 管理部門集約 start ($(date +'%Y-%m-%d %H:%M:%S')) ==="

cd "${REPO_DIR}" || { err "cd 失敗"; exit 1; }

# ============================================================
# STEP 1: 11-管理部門 ディレクトリ作成
# ============================================================
info "STEP 1: 11-管理部門 ディレクトリ作成"

if [ -d "agents/11-管理部門" ]; then
    warn "既に存在"
else
    mkdir -p "agents/11-管理部門"
fi

# ============================================================
# STEP 2: 既存ファイルの集約（git mv で履歴維持）
# ============================================================
info "STEP 2: 既存ファイルを 11-管理部門 へ集約"

# 11-法務部/nori.md → 11-管理部門/nori.md
if [ -f "agents/11-法務部/nori.md" ]; then
    git mv "agents/11-法務部/nori.md" "agents/11-管理部門/nori.md" 2>>"${LOG_FILE}" && \
        ok "nori.md を移動" || warn "nori.md 移動失敗"
else
    warn "agents/11-法務部/nori.md は既にない"
fi

# 14-経理財務部/finance.md → 11-管理部門/finance.md
if [ -f "agents/14-経理財務部/finance.md" ]; then
    git mv "agents/14-経理財務部/finance.md" "agents/11-管理部門/finance.md" 2>>"${LOG_FILE}" && \
        ok "finance.md を移動" || warn "finance.md 移動失敗"
fi

# 15-人事部/hr.md → 11-管理部門/hr.md
if [ -f "agents/15-人事部/hr.md" ]; then
    git mv "agents/15-人事部/hr.md" "agents/11-管理部門/hr.md" 2>>"${LOG_FILE}" && \
        ok "hr.md を移動" || warn "hr.md 移動失敗"
fi

# 空になった旧ディレクトリを削除
for olddir in "agents/11-法務部" "agents/14-経理財務部" "agents/15-人事部"; do
    if [ -d "${olddir}" ]; then
        # 中身が空かチェック（隠しファイル含む）
        if [ -z "$(ls -A "${olddir}" 2>/dev/null)" ]; then
            rmdir "${olddir}" 2>>"${LOG_FILE}" && info "${olddir} を削除" || warn "${olddir} 削除失敗"
        else
            warn "${olddir} に他のファイルあり、残します"
            ls -la "${olddir}" | tee -a "${LOG_FILE}"
        fi
    fi
done

# ============================================================
# STEP 3: 16-業務自動化部 → 14-業務自動化部 にリナンバー
# ============================================================
info "STEP 3: 16-業務自動化部 → 14-業務自動化部"

if [ -d "agents/16-業務自動化部" ] && [ ! -d "agents/14-業務自動化部" ]; then
    git mv "agents/16-業務自動化部" "agents/14-業務自動化部" 2>>"${LOG_FILE}" && \
        ok "16-業務自動化部 → 14-業務自動化部" || warn "リナンバー失敗"
else
    warn "リナンバー対象なし or 既に対象あり"
fi

# ============================================================
# STEP 4: 17-横断チーム → 15-横断チーム にリナンバー
# ============================================================
info "STEP 4: 17-横断チーム → 15-横断チーム"

if [ -d "agents/17-横断チーム" ] && [ ! -d "agents/15-横断チーム" ]; then
    git mv "agents/17-横断チーム" "agents/15-横断チーム" 2>>"${LOG_FILE}" && \
        ok "17-横断チーム → 15-横断チーム" || warn "リナンバー失敗"
else
    warn "リナンバー対象なし or 既に対象あり"
fi

# ============================================================
# STEP 5: 各ファイルの部署表記を更新
# ============================================================
info "STEP 5: ファイル内の部署表記を更新"

# 11-管理部門/nori.md, finance.md, hr.md の表記更新
for f in "agents/11-管理部門/nori.md" "agents/11-管理部門/finance.md" "agents/11-管理部門/hr.md"; do
    if [ -f "$f" ]; then
        sed -i.bak -E 's|11-法務部|11-管理部門|g; s|14-経理財務部|11-管理部門|g; s|15-人事部|11-管理部門|g' "$f"
        rm -f "$f.bak"
    fi
done

# 14-業務自動化部/, 15-横断チーム/ 内のファイル
if [ -d "agents/14-業務自動化部" ]; then
    for f in agents/14-業務自動化部/*.md; do
        [ -f "$f" ] && sed -i.bak -E 's|16-業務自動化部|14-業務自動化部|g' "$f" && rm -f "$f.bak"
    done
fi

if [ -d "agents/15-横断チーム" ]; then
    for f in agents/15-横断チーム/*.md; do
        [ -f "$f" ] && sed -i.bak -E 's|17-横断チーム|15-横断チーム|g' "$f" && rm -f "$f.bak"
    done
fi

ok "ファイル内表記の更新完了"

# ============================================================
# STEP 6: legal.md を新規追加
# ============================================================
info "STEP 6: legal.md を新規追加"

if [ -f "agents/11-管理部門/legal.md" ]; then
    warn "legal.md は既に存在"
else
    python3 "${BUILDER}" new \
        --src "${EIJI_DIR}/legal/prompt.md" \
        --dst "${REPO_DIR}/agents/11-管理部門/legal.md" \
        --name "Legal" --dept "11-管理部門" \
        --role "リーガル（法務 / 契約・知財・リスク法務担当）" \
        --specialty "契約書作成・レビュー、コンプライアンス管理、知財管理、リスク法務、訴訟対応"
    ok "legal.md 新規作成完了"
fi

# ============================================================
# STEP 7: SKILL.md の表記更新
# ============================================================
info "STEP 7: SKILL.md の表記更新"

sed -i.bak -E '
    s|11-法務部|11-管理部門|g
    s|14-経理財務部|11-管理部門|g
    s|15-人事部|11-管理部門|g
    s|16-業務自動化部|14-業務自動化部|g
    s|17-横断チーム|15-横断チーム|g
' "${REPO_DIR}/SKILL.md"
rm -f "${REPO_DIR}/SKILL.md.bak"

ok "SKILL.md 更新完了"

# ============================================================
# STEP 8: エージェント版の旧ディレクトリを削除
# ============================================================
info "STEP 8: エージェント版の旧ディレクトリを削除"

for olddir in \
    "${AGENTS_REPO}/.claude/agents/11-法務部" \
    "${AGENTS_REPO}/.claude/agents/14-経理財務部" \
    "${AGENTS_REPO}/.claude/agents/15-人事部" \
    "${AGENTS_REPO}/.claude/agents/16-業務自動化部" \
    "${AGENTS_REPO}/.claude/agents/17-横断チーム"; do
    if [ -d "${olddir}" ]; then
        rm -rf "${olddir}"
        ok "削除: $(basename ${olddir})"
    fi
done

# ============================================================
# STEP 9: README/AGENTS.md 再生成
# ============================================================
info "STEP 9: README/AGENTS.md 再生成"

python3 "${REPO_DIR}/scripts/sync-source-readmes.py" "${REPO_DIR}" 2>&1 | tee -a "${LOG_FILE}"

ok "README/AGENTS.md 再生成完了"

# ============================================================
# STEP 10: スキル版 commit & push
# ============================================================
info "STEP 10: スキル版へ commit & push"

cd "${REPO_DIR}"
git add -A 2>>"${LOG_FILE}"

if git diff --staged --quiet; then
    warn "ステージ済み変更なし"
else
    git commit -m "refactor(team): 11-管理部門に法務/経理財務/人事を集約 + legal新規追加 + 業務自動化/横断チームをリナンバー" 2>>"${LOG_FILE}" && \
        ok "commit 完了" || warn "commit 失敗"

    git push origin main 2>>"${LOG_FILE}" && \
        ok "push 完了" || warn "push 失敗"
fi

# ============================================================
# STEP 11: エージェント版へ同期
# ============================================================
info "STEP 11: エージェント版へ同期"

bash "${REPO_DIR}/scripts/sync-to-agents.sh" 2>&1 | tee -a "${LOG_FILE}" || \
    warn "sync-to-agents.sh が一部失敗"

ok "=========================================="
ok " 管理部門集約 完了！"
ok "=========================================="
info ""
info "新しい部署構成:"
info "  11-管理部門: nori（リーガル事前関所）, finance, hr, legal（新規）"
info "  14-業務自動化部（旧16）: bo, owl"
info "  15-横断チーム（旧17）: pm, qa, kpi, dat"
info ""
info "削除された空部署:"
info "  11-法務部 / 14-経理財務部 / 15-人事部"

ok "=== migrate-admin-dept done ($(date +'%Y-%m-%d %H:%M:%S')) ==="
exit 0
