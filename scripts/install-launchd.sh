#!/bin/bash
#
# install-launchd.sh
#
# Mac の launchd に「my-virtual-team 朝一回 自動コミットジョブ」をインストールする
# **一度だけ実行すれば、以降は毎朝1回（8:00 AM 起床時）に自動コミットされる**
#
# 動作:
#   - 朝 8:00 AM に launchd 発火
#   - Mac がスリープ中（蓋閉じ）の場合は、起床（蓋を開けた）瞬間に自動発火
#   - auto-commit.sh が Cowork タスクの完了を待ってから commit
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

info "my-virtual-team 朝一回 自動コミット launchd インストール開始"

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

# === 3. plist ファイル生成（朝一回用） ===
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

    <!-- 朝8:00に発火（Macがスリープ中なら蓋を開けた瞬間に自動発火） -->
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>8</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>

    <!-- launchd ロード時にも一度だけ発火（インストール直後の動作確認用） -->
    <key>RunAtLoad</key>
    <false/>

    <!-- 同時実行を防ぐ（Cowork待機中に再発火しないように） -->
    <key>ThrottleInterval</key>
    <integer>3600</integer>

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
echo "  実行時刻: 朝 8:00 AM（スリープ中なら蓋を開けた瞬間に自動発火）"
echo "  スクリプト: ${SCRIPT_PATH}"
echo "  ログ:     ${LOG_DIR}/auto-commit.log"
echo

# === 6. 動作確認の案内 ===
success "=========================================="
success "  朝一回 自動コミットジョブの登録が完了"
success "=========================================="
echo
info "動作の流れ:"
echo "  1. 朝、Macの蓋を開ける（スリープから復帰）"
echo "  2. Cowork タスクが自動キャッチアップ実行（4:09の遅延実行）"
echo "  3. Cowork が全32エージェントを編集中..."
echo "  4. 編集が落ち着くと auto-commit.sh が起動（8:00 または起床時）"
echo "  5. ファイル活動が止まるまで最大15分待機"
echo "  6. 自動 commit（push はしない）"
echo
info "確認コマンド:"
echo "  launchctl list | grep my-virtual-team"
echo
info "今すぐテスト実行する場合:"
echo "  bash ${SCRIPT_PATH}"
echo
info "アンインストール:"
echo "  bash ${HOME}/my-virtual-team/scripts/uninstall-launchd.sh"
echo
warn "注意:"
echo "  - 同日に2回目の実行はスキップされます（冪等性）"
echo "  - ログは ${LOG_DIR}/auto-commit.log で確認できます"
echo "  - push は自動で行われません（commit のみ）"
