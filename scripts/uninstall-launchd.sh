#!/bin/bash
#
# uninstall-launchd.sh
#
# my-virtual-team の自動コミット launchd ジョブをアンインストールする
#

set -uo pipefail

LABEL="com.matsuokahideto.my-virtual-team.auto-commit"
PLIST_PATH="${HOME}/Library/LaunchAgents/${LABEL}.plist"

if [ -f "${PLIST_PATH}" ]; then
    launchctl unload "${PLIST_PATH}" 2>/dev/null || true
    rm "${PLIST_PATH}"
    echo "✅ アンインストール完了: ${PLIST_PATH}"
else
    echo "ℹ️ ${PLIST_PATH} は存在しません（既にアンインストール済み）"
fi
