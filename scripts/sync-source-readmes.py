#!/usr/bin/env python3
"""
sync-source-readmes.py

~/my-virtual-team/ の README.md と AGENTS.md にあるマーカー間を、
agents/ 配下の実体から自動生成して書き換える。

新部署・新エージェント追加時の README / AGENTS.md の更新漏れを防止する。

マーカー仕様:
- README.md の部署テーブル:
    <!-- AGENTS_TABLE:START -->
    ... 自動生成テーブル ...
    <!-- AGENTS_TABLE:END -->
- AGENTS.md のディレクトリツリー:
    <!-- AGENTS_TREE:START -->
    ... 自動生成ツリー ...
    <!-- AGENTS_TREE:END -->
- 人数カウント（README.md の見出し）:
    ## 👥 チーム編成（<!-- AGENTS_COUNT -->NN<!-- AGENTS_COUNT_END -->人）

マーカーが無い場合はスキップ（破壊的変更しない）。

使い方:
    python3 sync-source-readmes.py REPO_ROOT
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROLE_RE = re.compile(r"\*\*役職\*\*[:：]\s*([^\n]+)", re.DOTALL)
PROFILE_RE = re.compile(r"##\s*プロフィール\s*\n(.+?)(?=\n##\s|\Z)", re.DOTALL)

TABLE_START = "<!-- AGENTS_TABLE:START -->"
TABLE_END = "<!-- AGENTS_TABLE:END -->"
# AGENTS.md のツリーはコードブロック内に置くため # コメント形式
TREE_START = "# AGENTS_TREE:START"
TREE_END = "# AGENTS_TREE:END"
COUNT_START = "<!-- AGENTS_COUNT -->"
COUNT_END = "<!-- AGENTS_COUNT_END -->"


def extract_role(content: str) -> str:
    """エージェントファイル本文から役職を抽出"""
    m_prof = PROFILE_RE.search(content)
    if m_prof:
        m_role = ROLE_RE.search(m_prof.group(1))
        if m_role:
            return m_role.group(1).strip().rstrip("。").rstrip("、")
    # フォールバック: 文書全体から探す
    m_role = ROLE_RE.search(content)
    if m_role:
        return m_role.group(1).strip().rstrip("。").rstrip("、")
    return ""


def collect_agents(agents_dir: Path) -> dict[str, list[dict]]:
    """部署ごとにエージェント情報を集める"""
    by_dept: dict[str, list[dict]] = {}
    for md in sorted(agents_dir.rglob("*.md")):
        if md.name == "designer_memory.md":
            continue
        rel = md.relative_to(agents_dir)
        if len(rel.parts) < 2:
            continue
        dept = rel.parts[0]
        name = md.stem
        content = md.read_text(encoding="utf-8")
        role = extract_role(content)
        by_dept.setdefault(dept, []).append({"name": name, "role": role})
    return by_dept


def render_readme_table(by_dept: dict[str, list[dict]]) -> str:
    """README.md 用の部署テーブルを生成"""
    lines = [
        TABLE_START,
        "",
        "| 部署 | エージェント（役職） |",
        "|------|------------------|",
    ]
    for dept in sorted(by_dept.keys()):
        agents = by_dept[dept]
        agent_strs = []
        for a in agents:
            if a["role"]:
                agent_strs.append(f"{a['name']}（{a['role']}）")
            else:
                agent_strs.append(a["name"])
        agents_str = " / ".join(agent_strs)
        lines.append(f"| {dept} | {agents_str} |")
    lines.append("")
    lines.append(TABLE_END)
    return "\n".join(lines)


def render_agents_tree(by_dept: dict[str, list[dict]]) -> str:
    """AGENTS.md のコードブロック内ディレクトリツリーを生成（マーカーは # 形式）"""
    lines = [TREE_START]
    sorted_depts = sorted(by_dept.keys())
    for i, dept in enumerate(sorted_depts):
        is_last_dept = (i == len(sorted_depts) - 1)
        connector = "└──" if is_last_dept else "├──"
        names = sorted([a["name"] for a in by_dept[dept]])
        if len(names) == 1:
            lines.append(f"│   {connector} {dept}/{names[0]}.md")
        else:
            joined = ",".join(names)
            lines.append(f"│   {connector} {dept}/{{{joined}}}.md")
    lines.append(TREE_END)
    return "\n".join(lines)


def total_agents(by_dept: dict[str, list[dict]]) -> int:
    return sum(len(v) for v in by_dept.values())


def replace_section(text: str, start_marker: str, end_marker: str, new_content: str) -> tuple[str, bool]:
    """text 内の start_marker から end_marker までを new_content で置換。
    マーカーが見つからない場合は (元のtext, False) を返す。"""
    pattern = re.compile(
        re.escape(start_marker) + r".*?" + re.escape(end_marker),
        re.DOTALL,
    )
    if pattern.search(text):
        return pattern.sub(new_content, text), True
    return text, False


def replace_count(text: str, count: int) -> tuple[str, bool]:
    """COUNT マーカー間の数字を更新"""
    pattern = re.compile(
        re.escape(COUNT_START) + r".*?" + re.escape(COUNT_END),
        re.DOTALL,
    )
    if pattern.search(text):
        return pattern.sub(f"{COUNT_START}{count}{COUNT_END}", text), True
    return text, False


def main():
    if len(sys.argv) < 2:
        print("使い方: python3 sync-source-readmes.py REPO_ROOT", file=sys.stderr)
        sys.exit(1)

    repo_root = Path(sys.argv[1]).expanduser().resolve()
    agents_dir = repo_root / "agents"
    if not agents_dir.is_dir():
        print(f"ERROR: {agents_dir} が見つかりません", file=sys.stderr)
        sys.exit(1)

    by_dept = collect_agents(agents_dir)
    total = total_agents(by_dept)

    print(f"検出: {len(by_dept)} 部署 / {total} エージェント")

    # README.md
    readme_path = repo_root / "README.md"
    if readme_path.exists():
        original = readme_path.read_text(encoding="utf-8")
        new_table = render_readme_table(by_dept)
        updated, replaced = replace_section(original, TABLE_START, TABLE_END, new_table)
        updated, count_replaced = replace_count(updated, total)
        if replaced or count_replaced:
            if updated != original:
                readme_path.write_text(updated, encoding="utf-8")
                print(f"README.md 更新: テーブル={replaced} / 人数={count_replaced}")
            else:
                print("README.md: 変更なし")
        else:
            print("WARN: README.md にマーカーが見つかりません。スキップ")

    # AGENTS.md
    agents_md_path = repo_root / "AGENTS.md"
    if agents_md_path.exists():
        original = agents_md_path.read_text(encoding="utf-8")
        new_tree = render_agents_tree(by_dept)
        updated, replaced = replace_section(original, TREE_START, TREE_END, new_tree)
        if replaced:
            if updated != original:
                agents_md_path.write_text(updated, encoding="utf-8")
                print(f"AGENTS.md 更新: ツリー={replaced}")
            else:
                print("AGENTS.md: 変更なし")
        else:
            print("WARN: AGENTS.md にマーカーが見つかりません。スキップ")

    print("完了")


if __name__ == "__main__":
    main()
