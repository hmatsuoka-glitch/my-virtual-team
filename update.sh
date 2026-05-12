#!/usr/bin/env bash
#
# my-virtual-team 更新スクリプト
#
# 使い方:
#   curl -sSL https://raw.githubusercontent.com/<USERNAME>/my-virtual-team/main/update.sh | bash
#
# またはローカルから:
#   bash update.sh
#

set -euo pipefail

SKILL_NAME="my-virtual-team"
TARGET_DIR="${HOME}/.claude/skills/${SKILL_NAME}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; }

info "my-virtual-team スキル 更新開始"

# シンボリックリンクの場合は実体側を更新
if [ -L "${TARGET_DIR}" ]; then
    REAL_DIR=$(readlink -f "${TARGET_DIR}")
    info "シンボリックリンク先: ${REAL_DIR}"
    cd "${REAL_DIR}"
elif [ -d "${TARGET_DIR}/.git" ]; then
    cd "${TARGET_DIR}"
else
    error "${TARGET_DIR} が Git リポジトリではありません"
    error "install.sh を再実行してください"
    exit 1
fi

# 変更がある場合の警告
if ! git diff --quiet; then
    warn "ローカル変更があります。stash しますか？"
    read -p "(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash push -m "auto-stash before update $(date +%Y%m%d-%H%M%S)"
    fi
fi

# pull
info "git pull 実行..."
git pull --rebase --autostash

success "=========================================="
success "  my-virtual-team スキル 更新完了"
success "=========================================="
echo
info "Claude Desktop / Cowork を再起動して反映してください"
