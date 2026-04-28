#!/bin/bash
#
# install-launchd.sh
#
# Mac の launchd に「my-virtual-team 自動コミットジョブ」をインストールする
# **一度だけ実行すれば、以降は毎日 04:30 AM に自動コミットされる**
#
# 使い方:
#   bash ~/my-virtual-team/scripts/install-launchd.sh
#

set -euo pipefail

# === 設定 ===
LABEL="com.matsuokahideto.my-virtual-team.auto-commit"
PLIST_DIR="${HOME}/Library/LaunchAgents"
PLIST_PATH="${PLIST_DIR}/${LABEL}.plist"
SCRIPT_PATH="${HOME}/my-virtual-team/scripts/auto-commit.sh"
LOG_DIR="${HOME}/my-virtual-team/logs"

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

info "my-virtual-team 自動コミット launchd インストール開始"

# === 1. 前提チェック ===
if [ ! -f "${SCRIPT_PATH}" ]; then
    error "auto-commit.sh が見つかりません: ${SCRIPT_PATH}"
    error "git pull 後に再実行してください"
    exit 1
fi

# auto-commit.sh に実行権限付与
chmod +x "${SCRIPT_PATH}"
success "auto-commit.sh に実行権限を付与"

# logs ディレクトリ準備
mkdir -p "${LOG_DIR}"
mkdir -p "${PLIST_DIR}"

# === 2. 既存のジョブをアンロード（あれば） ===
if [ -f "${PLIST_PATH}" ]; then
    warn "既存ジョブが見つかりました。アンロード中..."
    launchctl unload "${PLIST_PATH}" 2>/dev/null || true
fi

# === 3. plist ファイル生成 ===
info "plist 生成中: ${PLIST_PATH}"

cat > "${PLIST_PATH}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${LABEL}</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${SCRIPT_PATH}</string>
    </array>

    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>4</integer>
        <key>Minute</key>
        <integer>30</integer>
    </dict>

    <key>RunAtLoad</key>
    <false/>

    <key>StandardOutPath</key>
    <string>${LOG_DIR}/launchd.stdout.log</string>

    <key>StandardErrorPath</key>
    <string>${LOG_DIR}/launchd.stderr.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
        <key>HOME</key>
        <string>${HOME}</string>
    </dict>
</dict>
</plist>
EOF

success "plist 生成完了"

# === 4. ジョブをロード ===
info "launchd にロード中..."
launchctl load "${PLIST_PATH}"
success "launchd ジョブ登録完了"

# === 5. 確認 ===
echo
info "登録された情報:"
echo "  Label:    ${LABEL}"
echo "  実行時刻: 毎日 04:30 AM"
echo "  スクリプト: ${SCRIPT_PATH}"
echo "  ログ:     ${LOG_DIR}/auto-commit.log"
echo

# === 6. 動作確認の案内 ===
success "=========================================="
success "  自動コミットジョブの登録が完了しました"
success "=========================================="
echo
info "確認コマンド:"
echo "  launchctl list | grep my-virtual-team"
echo
info "今すぐテスト実行する場合:"
echo "  bash ${SCRIPT_PATH}"
echo
info "アンインストール:"
echo "  launchctl unload ${PLIST_PATH}"
echo "  rm ${PLIST_PATH}"
echo
warn "注意:"
echo "  - Mac が 04:30 AM にスリープしていた場合、起動時に実行されます"
echo "  - ログは ${LOG_DIR}/auto-commit.log で確認できます"
echo "  - push は自動で行われません（commit のみ）"
