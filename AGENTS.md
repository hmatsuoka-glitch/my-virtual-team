# AGENTS.md — Universal AI Agent Instructions

このリポジトリは **「LET事業バーチャルチーム」** のエージェント定義集です。

業界標準（[agents.md](https://agents.md/)）準拠で、以下のAIツールから利用できます：

- **Claude Code（ターミナル）** → CLAUDE.md または このファイル経由
- **Claude Desktop / Cowork** → `~/.claude/skills/my-virtual-team/SKILL.md` 経由
- **Cursor** → このファイルを直接読み込み
- **Codex / Amp / Windsurf** → このファイルを直接読み込み

---

## 🎯 主たる定義は SKILL.md

最も詳細で最新のチーム定義・振り分けルール・ワークフローは `SKILL.md` にあります。

```
@SKILL.md
```

このファイルを読み込んだAIは、SKILL.md に従って動作してください。

---

## 📁 リポジトリ構成

```
my-virtual-team/
├── SKILL.md                    # メインのスキル定義（HARU + 振り分けロジック）
├── CLAUDE.md                   # → SKILL.md を参照（軽量）
├── AGENTS.md                   # ← このファイル（業界標準・他ツール用）
├── agents/                     # 各エージェント定義（以下はマーカー間が自動生成）
# AGENTS_TREE:START
│   ├── 00-COO/{deva,sora}.md
│   ├── 01-経営企画部/{fuca,haruto,retri,sutu}.md
│   ├── 02-SNS運用部/{sho,yui}.md
│   ├── 03-コンテンツ制作部/{eito,itsuki,sou,takumi,toma}.md
│   ├── 04-クライアント管理部/{akari,ryota}.md
│   ├── 05-データ分析部/{deng,shun}.md
│   ├── 06-リサーチ部/{ana,rui}.md
│   ├── 07-LP部/{hana,iro,kaito,kotone,mia,nao,ren,saki,sota,tsumugi}.md
│   ├── 08-バナー生成部/{hiro,kana,rei,yuna}.md
│   ├── 09-システム開発部/{ao,kai,kuu,mio,nao,riku}.md
│   ├── 10-資料作成部/{aoi,mana,rin,souma,yuto}.md
│   ├── 11-法務部/nori.md
│   ├── 12-営業部/sales.md
│   ├── 13-マーケティング部/{marketing,pr}.md
│   ├── 14-経理財務部/finance.md
│   ├── 15-人事部/hr.md
│   ├── 16-業務自動化部/{bo,owl}.md
│   └── 17-横断チーム/{dat,kpi,pm,qa}.md
# AGENTS_TREE:END
├── workflows/                  # BMAD-METHOD準拠ワークフロー
│   ├── spec-driven/            # 要件→設計→タスク→実装
│   ├── bug-fix/                # 報告→解析→修正→検証
│   └── tdd/                    # TDD強制ルール
├── checklists/                 # BMAD品質チェックリスト
├── guidelines/                 # チーム共通ルール
├── templates/                  # ドキュメントテンプレート
├── install.sh                  # ワンライナー導入
└── README.md                   # 公開向け説明
```

---

## 🚀 各環境での導入

### Claude Desktop / Cowork
```bash
curl -sSL https://raw.githubusercontent.com/<USERNAME>/my-virtual-team/main/install.sh | bash
```

### Claude Code（ターミナル）
```bash
git clone https://github.com/<USERNAME>/my-virtual-team
cd my-virtual-team
# CLAUDE.md が SKILL.md を参照する設計なので、そのまま claude を起動すればOK
```

### Cursor / Codex / その他
```bash
# プロジェクトルートにこのリポジトリを置くか、
# AGENTS.md / SKILL.md を任意の場所に配置すればよい
```

---

## 📜 ライセンス

MIT License — 自由に利用・改変可能。詳細は LICENSE を参照。
