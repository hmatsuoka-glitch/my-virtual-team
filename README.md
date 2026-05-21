# 🤖 my-virtual-team

**Claude（Desktop / Cowork / Code）で動作する、25人体制のバーチャルチーム。**
BMAD-METHOD仕様駆動開発 + TDD強制で、思った通りのシステムを精度良く作る。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Skill](https://img.shields.io/badge/Claude-Skill-7C3AED)](https://docs.claude.com)
[![BMAD](https://img.shields.io/badge/BMAD--METHOD-Compatible-success)](https://github.com/bmad-code-org/BMAD-METHOD)

---

## 🚀 30秒で導入

```bash
curl -sSL https://raw.githubusercontent.com/<USERNAME>/my-virtual-team/main/install.sh | bash
```

これだけで `~/.claude/skills/my-virtual-team/` にスキルが配置されます。
Claude Desktop / Cowork を再起動して、新しい会話で「システム作って」「翔星建設のSNS戦略立てて」など指示するだけ。**自動でチームが起動**します。

---

## ✨ 特徴

### 🎯 思った通りに作れる（BMAD-METHOD準拠）
要件→設計→タスク分解→実装→テストまでを段階的に進めるので、**作りたいものとズレない**。

### 🛡️ TDD強制でバグを未然防止
全ての実装は **RED → GREEN → REFACTOR** のサイクル必須。テストカバレッジ80%以上を保証。

### ⚡ 真の並列実行
独立タスクは Agent tool で**本当に同時実行**。1人のClaudeが順番に演じるのではなく、複数のClaudeが本物の並列で動く。

### 📦 リポジトリに何も置かなくていい
スキル方式なので、各プロジェクトに `.md` ファイルを配置する必要なし。
Claude Desktop / Cowork なら `~/.claude/skills/` に1度入れれば全プロジェクトで動く。

### 🌐 業界標準対応
- `SKILL.md` → Claude Desktop / Cowork
- `AGENTS.md` → Cursor / Codex / Amp / Windsurf
- `CLAUDE.md` → Claude Code（ターミナル）

---

## 👥 チーム編成（<!-- AGENTS_COUNT -->36<!-- AGENTS_COUNT_END -->人）

> 以下のテーブルは `agents/` 配下から自動生成されています。マーカー間は手動で編集しないでください。
> 編集する場合は `scripts/sync-source-readmes.py` のロジックを修正してください。

<!-- AGENTS_TABLE:START -->

| 部署 | エージェント（役職） |
|------|------------------|
| 00-COO | sora（COO / クオリティアシュアランスリード） |
| 01-経営企画部 | haruto（経営企画リード） |
| 02-SNS運用部 | sho（SNSコンテンツストラテジスト） / yui（SNSアナリスト / トレンドリサーチャー） |
| 03-コンテンツ制作部 | eito（動画クリエイティブディレクター） / itsuki（ビジュアルディレクター） / sou（TikTokトレンド・リサーチャー） / takumi（TikTok撮影・編集ディレクター） / toma（TikTok台本クリエイター） |
| 04-クライアント管理部 | akari（採用広告レポートアナリスト） / ryota（クライアントサクセスマネージャー） |
| 05-データ分析部 | shun（データアナリスト） |
| 06-リサーチ部 | rui（インダストリーリサーチャー） |
| 07-LP複製部 | hana（CSS抽出スペシャリスト） / kaito（LP複製プロジェクトディレクター） / mia（ビジュアルQAスペシャリスト） / nao（フロントエンド設計スペシャリスト） / ren（フロントエンド実装スペシャリスト） / saki（LP修正スペシャリスト） / sota（LPデザイン企画スペシャリスト） |
| 08-バナー生成部 | hiro（画像変換スペシャリスト） / kana（HTMLバナーデザイナー） / rei（コピーライティングスペシャリスト） / yuna（バナー生成部 部長 / 広告クリエイティブディレクター） |
| 09-システム開発部 | ao（バックエンドエンジニア） / kai（部長 / プロジェクトマネージャー（BMAD-METHOD PM相当）） / kuu（インフラエンジニア / DevOpsエンジニア） / mio（QAエンジニア / テストエンジニア） / nao（システムアーキテクト / 要件定義エンジニア） / riku（フロントエンドエンジニア） |
| 10-資料作成部 | aoi（テンプレート・ガーディアン（監査専任）） / mana（QA / 校閲・品質管理（最終ゲートキーパー）） / rin（コンテンツクリエイター） / souma（デザイナー） / yuto（部長 / ディレクター） |
| 11-法務部 | nori（リーガルチェック・コンプライアンス担当） |

<!-- AGENTS_TABLE:END -->

---

## 📋 使い方

### 例1: SNS戦略
```
あなた: 「翔星建設のSNS戦略立てて」
↓
HARU 自動起動 → haruto に振り分け → 戦略立案 → Sora QA → 出力
```

### 例2: システム開発（BMAD-METHOD適用）
```
あなた: 「採用管理システムを Next.js で作って」
↓
HARU → kai → BMADワークフロー開始
  STEP 1: nao が要件定義（ユーザーストーリー + 受け入れ基準）
  STEP 2: nao が設計（アーキテクチャ + DB + API）
  STEP 3: kai がタスク分解
  STEP 4: riku/ao/kuu が並列実装（TDD強制）
  STEP 5: mio が QAゲート判定
  STEP 6: sora が最終QA
↓
動くシステム + テストカバレッジレポートが完成
```

### 例3: 並列タスク
```
あなた: 「翔星建設の月次レポートと提案書」
↓
HARU が Agent tool で並列起動:
  ├─ akari: 月次レポート作成
  └─ ryota: 提案書作成
↓
両方完了 → 統合 → Sora QA → 出力
```

---

## 🏗️ ディレクトリ構成

```
my-virtual-team/
├── SKILL.md                    # スキル定義（Claude Desktop/Cowork）
├── AGENTS.md                   # 業界標準（Cursor/Codex対応）
├── CLAUDE.md                   # → SKILL.md 参照
├── agents/                     # 25人のエージェント定義
│   └── 00-COO 〜 10-資料作成部/
├── workflows/                  # BMAD-METHOD ワークフロー
│   ├── spec-driven/            # 仕様駆動開発（要件→設計→タスク→実装）
│   ├── bug-fix/                # バグ修正フロー（報告→解析→修正→検証）
│   └── tdd/                    # TDD強制ルール
├── checklists/                 # BMAD品質チェックリスト
│   ├── architect-checklist.md
│   ├── dev-completion.md
│   ├── tdd-checklist.md
│   └── qa-gate.md
├── guidelines/                 # チーム共通ルール
├── templates/                  # ドキュメントテンプレート
├── install.sh                  # ワンライナー導入
├── update.sh                   # 更新スクリプト
├── LICENSE                     # MIT
└── README.md                   # このファイル
```

---

## 🔄 更新

```bash
curl -sSL https://raw.githubusercontent.com/<USERNAME>/my-virtual-team/main/update.sh | bash
```

または：
```bash
cd ~/.claude/skills/my-virtual-team
git pull
```

---

## 🗑️ アンインストール

```bash
rm -rf ~/.claude/skills/my-virtual-team
```

---

## 🛠️ カスタマイズ

このリポジトリを fork して、自分のチーム構成に合わせて編集できます。

1. fork する
2. `agents/` 配下を自社向けに編集
3. `SKILL.md` の振り分けルールを更新
4. install.sh の `REPO_URL` を自分のリポジトリに変更
5. push

---

## 🤝 貢献

PR歓迎。新しい部署・エージェント・ワークフローの追加など。

---

## 📜 ライセンス

[MIT License](LICENSE) — 自由に利用・改変可能。

---

## 🙏 クレジット

- BMAD-METHOD: https://github.com/bmad-code-org/BMAD-METHOD
- TDD Guard: https://github.com/nizos/tdd-guard
- AGENTS.md standard: https://agents.md/
