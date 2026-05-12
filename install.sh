#!/usr/bin/env bash
#
# my-virtual-team インストールスクリプト
#
# 使い方:
#   curl -sSL https://raw.githubusercontent.com/<USERNAME>/my-virtual-team/main/install.sh | bash
#
# またはローカルから:
#   bash install.sh
#

set -euo pipefail

# === 設定 ===
REPO_URL="${REPO_URL:-https://github.com/matsuokahideto/my-virtual-team.git}"
SKILL_NAME="my-virtual-team"
TARGET_DIR="${HOME}/.claude/skills/${SKILL_NAME}"
SOURCE_DIR="${HOME}/my-virtual-team"

# === 色付き出力 ===
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# === メイン処理 ===

info "my-virtual-team スキル インストール開始"
info "target: ${TARGET_DIR}"

# 1. ~/.claude/skills/ ディレクトリを作成
mkdir -p "${HOME}/.claude/skills"

# 2. 既存のスキルがあるかチェック
if [ -e "${TARGET_DIR}" ] || [ -L "${TARGET_DIR}" ]; then
    warn "${TARGET_DIR} が既に存在します"
    read -p "上書きしますか？ (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "中止しました"
        exit 0
    fi
    rm -rf "${TARGET_DIR}"
fi

# 3. ソースを取得
if [ -d "${SOURCE_DIR}/.git" ]; then
    # ローカルにソースがある場合 → シンボリックリンクで紐付け
    info "ローカルリポジトリを検出: ${SOURCE_DIR}"
    info "シンボリックリンクで紐付けます（編集が即反映）"
    ln -s "${SOURCE_DIR}" "${TARGET_DIR}"
    success "シンボリックリンク作成: ${TARGET_DIR} -> ${SOURCE_DIR}"
else
    # GitHub から clone
    info "GitHubからクローン: ${REPO_URL}"
    git clone "${REPO_URL}" "${TARGET_DIR}"
    success "クローン完了: ${TARGET_DIR}"
fi

# 4. SKILL.md の存在確認
if [ ! -f "${TARGET_DIR}/SKILL.md" ]; then
    error "${TARGET_DIR}/SKILL.md が見つかりません"
    error "リポジトリ構造を確認してください"
    exit 1
fi

# 5. 完了メッセージ
echo
success "=========================================="
success "  my-virtual-team スキル インストール完了"
success "=========================================="
echo
info "次のステップ:"
echo "  1. Claude Desktop / Cowork を再起動"
echo "  2. 新しい会話を開始"
echo "  3. 業務指示を入力（例: '翔星建設のSNS戦略を立てて'）"
echo "  4. HARU が自動起動して該当エージェントに振り分け"
echo
info "更新する場合:"
echo "  curl -sSL ${REPO_URL%.git}/raw/main/update.sh | bash"
echo
info "アンインストール:"
echo "  rm -rf ${TARGET_DIR}"
echo
