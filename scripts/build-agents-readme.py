#!/usr/bin/env python3
"""
build-agents-readme.py

~/my-virtual-team-agents/.claude/agents/ から全エージェントを走査して
AGENTS.md を自動生成する。

使い方:
    python3 build-agents-readme.py REPO_ROOT
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
NAME_RE = re.compile(r"^name:\s*(.+?)$", re.MULTILINE)
DESC_RE = re.compile(r'^description:\s*"(.+?)"$', re.MULTILINE)


def read_agent(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8")
    m = FRONTMATTER_RE.match(raw)
    if not m:
        return {"name": path.stem, "description": "", "path": path}
    fm = m.group(1)
    name_m = NAME_RE.search(fm)
    desc_m = DESC_RE.search(fm)
    return {
        "name": name_m.group(1).strip() if name_m else path.stem,
        "description": desc_m.group(1).strip() if desc_m else "",
        "path": path,
    }


def main():
    if len(sys.argv) < 2:
        print("使い方: python3 build-agents-readme.py REPO_ROOT", file=sys.stderr)
        sys.exit(1)

    repo_root = Path(sys.argv[1]).expanduser().resolve()
    agents_dir = repo_root / ".claude" / "agents"

    if not agents_dir.is_dir():
        print(f"ERROR: {agents_dir} が見つかりません", file=sys.stderr)
        sys.exit(1)

    # 部署ごとに整理
    by_dept: dict[str, list[dict]] = {}
    for md in sorted(agents_dir.rglob("*.md")):
        rel = md.relative_to(agents_dir)
        dept = rel.parts[0] if len(rel.parts) > 1 else "_その他"
        info = read_agent(md)
        info["rel"] = rel
        by_dept.setdefault(dept, []).append(info)

    # AGENTS.md 生成
    lines = ["# AGENTS — 全エージェント一覧", ""]
    lines.append("このリポジトリに含まれる Claude Code subagent の一覧です。")
    lines.append("各エージェントは `@<name>` または Task tool の `subagent_type` で呼び出せます。")
    lines.append("")

    total = 0
    for dept in sorted(by_dept.keys()):
        lines.append(f"## {dept}")
        lines.append("")
        for agent in by_dept[dept]:
            total += 1
            link = f".claude/agents/{agent['rel']}"
            desc = agent["description"] or "（説明未設定）"
            lines.append(f"- **[{agent['name']}]({link})** — {desc}")
        lines.append("")

    lines.append(f"---")
    lines.append(f"")
    lines.append(f"**合計 {total} エージェント**（自動生成 / 編集禁止）")
    lines.append("")

    out_path = repo_root / "AGENTS.md"
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"生成: {out_path} ({total} エージェント)")


if __name__ == "__main__":
    main()
