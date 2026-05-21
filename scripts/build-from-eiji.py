#!/usr/bin/env python3
"""
build-from-eiji.py

eijiyoshikawa/agents の prompt.md を、my-virtual-team 形式の
エージェント定義ファイル（agents/<部署>/<name>.md）に変換する。

2モードあり：
  --new  : 新規エージェントとして全文を変換して書き出し
  --merge: 既存エージェントに「## 追加能力（eijiyoshikawa/agents より統合）」セクションを追記

使い方:
    # 新規追加
    python3 build-from-eiji.py new \
        --src ~/eijiyoshikawa-agents/agents/sales/prompt.md \
        --dst ~/my-virtual-team/agents/12-営業部/sales.md \
        --name Sales \
        --dept 12-営業部 \
        --role "営業マネージャー" \
        --specialty "リード管理、商談パイプライン、受注管理"

    # 既存統合
    python3 build-from-eiji.py merge \
        --src ~/eijiyoshikawa-agents/agents/strategist/prompt.md \
        --dst ~/my-virtual-team/agents/01-経営企画部/haruto.md \
        --source-name strategist
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROLE_RE = re.compile(r"^##\s*役割\s*\n(.+?)(?=\n##\s|\Z)", re.DOTALL | re.MULTILINE)
MISSION_RE = re.compile(r"^##\s*(?:ミッション|目的|責務)\s*\n(.+?)(?=\n##\s|\Z)", re.DOTALL | re.MULTILINE)
TASKS_RE = re.compile(r"^##\s*(?:主要タスク|タスク|処理|主要処理|業務プロセス|実行手順|主要業務|主な業務|プロセス)\s*\n(.+?)(?=\n##\s|\Z)", re.DOTALL | re.MULTILINE)
OUTPUT_RE = re.compile(r"^##\s*(?:出力フォーマット|出力|アウトプット|成果物|納品物)\s*\n(.+?)(?=\n##\s|\Z)", re.DOTALL | re.MULTILINE)
INPUT_RE = re.compile(r"^##\s*(?:入力|インプット)\s*\n(.+?)(?=\n##\s|\Z)", re.DOTALL | re.MULTILINE)
TOOLS_RE = re.compile(r"^##\s*(?:使用ツール|ツール|使用するツール)\s*\n(.+?)(?=\n##\s|\Z)", re.DOTALL | re.MULTILINE)

INTEGRATION_MARKER = "## 追加能力（eijiyoshikawa/agents より統合）"


def truncate(text: str, max_len: int = 1500) -> str:
    """長すぎる場合は省略"""
    text = text.strip()
    if len(text) <= max_len:
        return text
    return text[:max_len].rsplit("\n", 1)[0] + "\n\n（…続きは元のprompt.md参照）"


def extract_section(content: str, regex) -> str:
    m = regex.search(content)
    return m.group(1).strip() if m else ""


def build_new_agent(src_content: str, name: str, dept: str, role: str, specialty: str) -> str:
    """新規エージェント用の my-virtual-team 形式 .md を生成"""
    role_text = extract_section(src_content, ROLE_RE)
    mission_text = extract_section(src_content, MISSION_RE)
    tasks_text = extract_section(src_content, TASKS_RE)
    output_text = extract_section(src_content, OUTPUT_RE)
    input_text = extract_section(src_content, INPUT_RE)

    # 役割定義: 役割 + ミッション を統合
    role_def_parts = []
    if role_text:
        role_def_parts.append(role_text)
    if mission_text:
        role_def_parts.append("**ミッション**:\n" + mission_text)
    role_def = "\n\n".join(role_def_parts) if role_def_parts else f"{role}として、{specialty} を担当する。"

    lines = [
        f"# {name} — {dept} / {role}",
        "",
        "## プロフィール",
        f"- **部署**: {dept}",
        f"- **役職**: {role}",
        f"- **専門領域**: {specialty}",
        "",
        "## 役割定義",
        truncate(role_def, 1500),
        "",
        "## 専門スキル / 業務プロセス",
    ]

    if tasks_text:
        lines.append(truncate(tasks_text, 3500))
    else:
        lines.append(f"- {specialty}")
    lines.append("")

    if input_text:
        lines.append("## 入力")
        lines.append(truncate(input_text, 800))
        lines.append("")

    lines.append("## 出力フォーマット")
    if output_text:
        lines.append(truncate(output_text, 2500))
    else:
        lines.append("（このエージェントが出力する成果物のフォーマット）")
    lines.append("")

    lines.append("## 担当クライアント")
    lines.append("全7社（エスコプロモーション、cantera、ナワショウ、宮村建設、清一建設、桝本レッカー、翔星建設）")
    lines.append("※ 部署や役割により担当範囲が異なる場合は調整")
    lines.append("")

    lines.append("## 連携エージェント")
    lines.append("- HARU（代表）: 全体方針の確認・意思決定")
    lines.append("- sora（COO/最終QA）: 成果物の最終チェック")
    lines.append("- （その他連携先は実運用で追記）")
    lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## 出典")
    lines.append("このエージェントは [eijiyoshikawa/agents](https://github.com/eijiyoshikawa/agents) を参考に my-virtual-team 形式に統合・適合化したものです。")
    lines.append("")

    lines.append("## 📝 Daily Knowledge Log")
    lines.append("")
    lines.append("<!-- 翌朝の Daily Agent Enhancement タスクが自動で日付エントリを追記します -->")
    lines.append("")

    return "\n".join(lines)


def build_merge_block(src_content: str, source_name: str) -> str:
    """既存エージェントへの追加能力セクションを生成"""
    role_text = extract_section(src_content, ROLE_RE)
    tasks_text = extract_section(src_content, TASKS_RE)
    output_text = extract_section(src_content, OUTPUT_RE)

    lines = [
        "",
        "---",
        "",
        INTEGRATION_MARKER,
        "",
        f"### 出典: `eijiyoshikawa/agents/{source_name}`",
        "",
    ]

    if role_text:
        lines.append("#### 追加された役割範囲")
        lines.append(truncate(role_text, 800))
        lines.append("")

    if tasks_text:
        lines.append("#### 追加タスク・スキル")
        lines.append(truncate(tasks_text, 2000))
        lines.append("")

    if output_text:
        lines.append("#### 追加出力フォーマット")
        lines.append(truncate(output_text, 1500))
        lines.append("")

    lines.append("> このセクションは外部リポジトリ統合により追加されました。元プロフィール・役割定義は本ファイル上部に維持されています。")
    lines.append("")

    return "\n".join(lines)


def cmd_new(args):
    src = Path(args.src).expanduser().resolve()
    dst = Path(args.dst).expanduser().resolve()
    if not src.is_file():
        print(f"ERROR: {src} not found", file=sys.stderr)
        sys.exit(1)
    src_content = src.read_text(encoding="utf-8")
    new_content = build_new_agent(
        src_content,
        name=args.name,
        dept=args.dept,
        role=args.role,
        specialty=args.specialty,
    )
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        existing = dst.read_text(encoding="utf-8")
        if existing == new_content:
            print(f"[unchanged] {dst}")
            return
    dst.write_text(new_content, encoding="utf-8")
    print(f"[created]   {dst}")


def cmd_merge(args):
    src = Path(args.src).expanduser().resolve()
    dst = Path(args.dst).expanduser().resolve()
    if not src.is_file():
        print(f"ERROR: {src} not found", file=sys.stderr)
        sys.exit(1)
    if not dst.is_file():
        print(f"ERROR: {dst} not found", file=sys.stderr)
        sys.exit(1)

    src_content = src.read_text(encoding="utf-8")
    dst_content = dst.read_text(encoding="utf-8")

    new_block = build_merge_block(src_content, args.source_name)

    # 既に統合済みかチェック（同じ source_name のブロックがあるか）
    marker_pattern = re.compile(
        re.escape(INTEGRATION_MARKER) + r"\s*\n.*?### 出典:\s*`?eijiyoshikawa/agents/" + re.escape(args.source_name) + r"`?",
        re.DOTALL,
    )
    if marker_pattern.search(dst_content):
        print(f"[skip-merged] {dst.name}: {args.source_name} は既に統合済み")
        return

    # 末尾にある "## 📝 Daily Knowledge Log" の前に挿入、なければ末尾に追加
    daily_log_idx = dst_content.find("## 📝 Daily Knowledge Log")
    if daily_log_idx != -1:
        new_content = dst_content[:daily_log_idx] + new_block + "\n" + dst_content[daily_log_idx:]
    else:
        new_content = dst_content.rstrip() + "\n" + new_block + "\n"

    # 既に他の eijiyoshikawa 統合ブロックがある場合、INTEGRATION_MARKER の見出しは重複させない
    # → 同じ見出しが2回出現したら、2回目以降をなくす
    if dst_content.count(INTEGRATION_MARKER) >= 1:
        # 既存に統合セクションがある場合は、見出しを省いた形で追記
        new_block_without_marker = "\n".join(
            l for i, l in enumerate(new_block.split("\n"))
            if l.strip() != INTEGRATION_MARKER
        )
        if daily_log_idx != -1:
            new_content = dst_content[:daily_log_idx] + new_block_without_marker + "\n" + dst_content[daily_log_idx:]
        else:
            new_content = dst_content.rstrip() + "\n" + new_block_without_marker + "\n"

    dst.write_text(new_content, encoding="utf-8")
    print(f"[merged]    {dst.name}: + {args.source_name}")


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_new = sub.add_parser("new")
    p_new.add_argument("--src", required=True)
    p_new.add_argument("--dst", required=True)
    p_new.add_argument("--name", required=True)
    p_new.add_argument("--dept", required=True)
    p_new.add_argument("--role", required=True)
    p_new.add_argument("--specialty", required=True)
    p_new.set_defaults(func=cmd_new)

    p_merge = sub.add_parser("merge")
    p_merge.add_argument("--src", required=True)
    p_merge.add_argument("--dst", required=True)
    p_merge.add_argument("--source-name", required=True)
    p_merge.set_defaults(func=cmd_merge)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
