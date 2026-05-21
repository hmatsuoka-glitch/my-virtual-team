# Strategy Proposal Pipeline — 戦略提案パイプライン

eijiyoshikawa/agents から取り込んだ「戦略提案パイプライン」の実行手順です。

## my-virtual-team でのエージェントマッピング

eijiyoshikawa の元エージェント名 → my-virtual-team の該当エージェント:

| eijiyoshikawa | my-virtual-team | 役割 |
| --- | --- | --- |
| retriever | `agents/01-経営企画部/retri.md` | 議事録取得・構造化 |
| issue_structurer | `agents/01-経営企画部/sutu.md` | 課題言語化・構造化 |
| market_researcher | `agents/06-リサーチ部/rui.md` | 市場・競合・顧客分析 |
| analogy_finder | `agents/06-リサーチ部/ana.md` | 異業種アナロジー事例 |
| marketing_analyst | `agents/02-SNS運用部/yui.md` | マーケ施策深掘り分析 |
| strategist | `agents/01-経営企画部/haruto.md` | 戦略構築 |
| devils_advocate | `agents/00-COO/deva.md` | 批判的検証 |
| report_builder | `agents/10-資料作成部/yuto.md` | Google Slides提案資料 |
| document_builder | `agents/10-資料作成部/yuto.md` | 対話型提案資料 |
| qa_reviewer | `agents/17-横断チーム/qa.md` または `agents/00-COO/sora.md` | 品質検証 |

## 実行方法

1. `PIPELINE.md` を Read で読み込む
2. 各 STEP で指定されたエージェントを上記マッピング表で対応エージェントに置き換えて起動
3. `run.md` の手順に従って段階実行

## 関連ファイル

- [PIPELINE.md](./PIPELINE.md) — パイプラインの詳細手順
- [run.md](./run.md) — ワンショット実行プロンプト
