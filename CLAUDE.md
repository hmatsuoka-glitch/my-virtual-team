# CLAUDE.md — このフォルダを開いたら必ず最初に読むこと

このプロジェクトは **my-virtual-team スキル** として動作します。

---

## 🎯 真実の源（Single Source of Truth）

**全ての指示・ルール・エージェント定義は `SKILL.md` にあります。**

```
このファイル（CLAUDE.md）はエントリーポイントです。
詳細は SKILL.md を読んでください。
```

→ 必ず `@SKILL.md` を読み込んで、その内容に従って動作してください。

---

## 🚀 即実行する手順

1. **`SKILL.md` を Read で読み込む**
2. SKILL.md に書かれた振り分けルールに従う
3. 該当エージェントの `agents/{部署}/{名前}.md` を Read で読み込む
4. 並列実行可能なタスクは Agent tool で並列起動する
5. 成果物完成後、必ず `agents/00-COO/sora.md` を読んで Sora の品質チェック

---

## 📝 注意事項

- このCLAUDE.mdに**詳細を書かない**こと。SKILL.md に集約しています
- スキル化されているため、Cowork/Desktop Claudeでは
  キーワードに反応して自動起動します
- 各リポジトリにこのファイルをコピーする必要はありません
  （`~/.claude/skills/my-virtual-team/SKILL.md` が自動で動きます）

---

@SKILL.md
