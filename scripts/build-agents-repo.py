#!/usr/bin/env python3
"""
build-agents-repo.py

ローカル ~/my-virtual-team/agents/**/*.md を読み取り、
Claude Code の subagent 形式（YAML frontmatter 付き）で
~/my-virtual-team-agents/.claude/agents/**/*.md に書き出す。

- 既存の H1 と本文はそのまま保持
- frontmatter は「役割定義」セクションの先頭文から自動生成
- 既に frontmatter があるファイルは frontmatter を維持し本文だけ更新
- ファイル名・サブディレクトリ構造は元のまま保持（重複name対策）

使い方:
    python3 build-agents-repo.py SRC_AGENTS_DIR DST_AGENTS_DIR [--initial]

    SRC_AGENTS_DIR: ~/my-virtual-team/agents
    DST_AGENTS_DIR: ~/my-virtual-team-agents/.claude/agents
    --initial: 初回ビルド時に指定（既存 frontmatter が無い前提）
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
ROLE_SECTION_RE = re.compile(r"##\s*役割定義\s*\n(.+?)(?=\n##\s|\Z)", re.DOTALL)
H1_RE = re.compile(r"^#\s+(.+?)\n", re.DOTALL)
WHITESPACE_RE = re.compile(r"\s+")


def extract_description(body: str) -> str:
    """役割定義セクションから description を生成（200字程度）"""
    m = ROLE_SECTION_RE.search(body)
    if not m:
        # フォールバック: H1 の後の最初の段落
        h1_match = H1_RE.search(body)
        if h1_match:
            return h1_match.group(1).strip()
        return "LET バーチャルチームのエージェント"

    raw = m.group(1).strip()
    # 先頭の数行を取って改行・記号を整理
    lines = [l.strip() for l in raw.split("\n") if l.strip()]
    # 箇条書きやコロン記号を除去
    text = " ".join(lines)
    text = re.sub(r"^[-*・]\s*", "", text)
    text = WHITESPACE_RE.sub(" ", text).strip()
    # 200字でカット
    if len(text) > 200:
        text = text[:197] + "..."
    return text


def build_frontmatter(agent_name: str, description: str, dept: str) -> str:
    """YAML frontmatter 文字列を生成"""
    # description はダブルクォートで囲む（YAML特殊文字対応）
    desc_safe = description.replace('"', "'").replace("\n", " ")
    fm_lines = [
        "---",
        f"name: {agent_name}",
        f'description: "{desc_safe}"',
        f"# 部署: {dept}",
        "---",
    ]
    return "\n".join(fm_lines) + "\n\n"


def strip_existing_frontmatter(content: str) -> tuple[str | None, str]:
    """既存 frontmatter があれば取り出し、本文を返す"""
    m = FRONTMATTER_RE.match(content)
    if m:
        return m.group(1), content[m.end():]
    return None, content


def convert_one(src_path: Path, dst_path: Path, initial: bool = False) -> tuple[bool, str]:
    """1ファイルを変換。戻り値: (変更有無, ステータス文字列)"""
    raw = src_path.read_text(encoding="utf-8")

    # 元ファイルの frontmatter は無視して本文だけ取得
    _, body = strip_existing_frontmatter(raw)

    # name はファイル名（拡張子除く）
    agent_name = src_path.stem
    # 部署はサブディレクトリ名（例: 02-SNS運用部）
    dept = src_path.parent.name

    description = extract_description(body)

    # 既存 dst ファイルがあれば frontmatter を維持して本文だけ差し替える
    if dst_path.exists() and not initial:
        existing = dst_path.read_text(encoding="utf-8")
        fm_text, _ = strip_existing_frontmatter(existing)
        if fm_text:
            # 既存 frontmatter + 本文（新）
            new_content = f"---\n{fm_text}\n---\n\n{body.lstrip()}"
            if new_content == existing:
                return False, "unchanged"
            dst_path.write_text(new_content, encoding="utf-8")
            return True, "updated-body"

    # 新規 or frontmatter 無し → 新規生成
    fm = build_frontmatter(agent_name, description, dept)
    new_content = fm + body.lstrip()
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    if dst_path.exists() and dst_path.read_text(encoding="utf-8") == new_content:
        return False, "unchanged"
    dst_path.write_text(new_content, encoding="utf-8")
    return True, "created" if not dst_path.exists() else "updated-full"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("src", help="ソースの agents/ ディレクトリ")
    parser.add_argument("dst", help="変換先の .claude/agents/ ディレクトリ")
    parser.add_argument("--initial", action="store_true", help="初回ビルド時に指定")
    args = parser.parse_args()

    src = Path(args.src).expanduser().resolve()
    dst = Path(args.dst).expanduser().resolve()

    if not src.is_dir():
        print(f"ERROR: ソースディレクトリが見つかりません: {src}", file=sys.stderr)
        sys.exit(1)

    dst.mkdir(parents=True, exist_ok=True)

    count_total = 0
    count_changed = 0
    skipped = []

    for md_path in sorted(src.rglob("*.md")):
        if md_path.name == "designer_memory.md":
            skipped.append(str(md_path))
            continue

        # サブディレクトリ構造を維持
        rel = md_path.relative_to(src)
        dst_path = dst / rel
        changed, status = convert_one(md_path, dst_path, initial=args.initial)
        count_total += 1
        if changed:
            count_changed += 1
        print(f"[{status}] {rel}")

    print()
    print(f"=== 完了: 処理 {count_total} ファイル / 変更 {count_changed} ファイル ===")
    if skipped:
        print(f"スキップ: {len(skipped)} ファイル")


if __name__ == "__main__":
    main()
