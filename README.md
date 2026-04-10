# my-virtual-team — LET事業バーチャルチーム

株式会社LETのSNSマーケティング×採用支援サービス「サクバズ」を支援するAIエージェントチーム。

## チーム構成

| 部署 | エージェント | 役割 |
|------|------------|------|
| 01-経営企画部 | Haruto | 戦略・KPI・事業計画 |
| 02-SNS運用部 | Sho | X/Instagram投稿企画 |
| 02-SNS運用部 | Yui | バズ分析・トレンド調査 |
| 03-コンテンツ制作部 | Eito | 動画企画・台本 |
| 03-コンテンツ制作部 | Itsuki | バナー・サムネ指示 |
| 04-クライアント管理部 | Ryota | 7社の案件管理・提案書 |
| 04-クライアント管理部 | Akari | 採用広告レポート作成 |
| 05-データ分析部 | Shun | Airworkデータ分析・可視化 |
| 06-リサーチ部 | Rui | 建設業界トレンド・競合調査 |

## フォルダ構成

```
my-virtual-team/
├── agents/
│   ├── 01-経営企画部/haruto.md
│   ├── 02-SNS運用部/sho.md, yui.md
│   ├── 03-コンテンツ制作部/eito.md, itsuki.md
│   ├── 04-クライアント管理部/ryota.md, akari.md
│   ├── 05-データ分析部/shun.md
│   └── 06-リサーチ部/rui.md
├── guidelines/
│   └── team-rules.md
├── templates/
│   ├── monthly-report.md
│   └── proposal.md
└── .claude/commands/
```

## 使い方
各エージェントのmdファイルを読み込み、役割・出力フォーマットに従って指示を出す。
