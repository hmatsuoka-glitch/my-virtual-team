# STEP 4: 実装（Implementation）

**担当**: Riku（FE）/ Ao（BE）/ Kuu（インフラ）が並列実行
**前段**: STEP 3 タスク分解
**後段**: STEP 5 QAテスト

---

## 🎯 目的

設計通り・要件通り・**テストカバレッジ80%以上で**動くコードを作る。
**TDD（テスト駆動開発）を厳守すること。** 詳細は `workflows/tdd/tdd-rules.md` を必ず Read。

---

## ⚡ 並列実行ルール

### 真の並列実行（Agent tool）

各実装タスクは**独立した Agent として並列起動**する。

```
kai が tasks.md を読む
↓
Phase 2 の独立タスクを Agent tool で同時起動：

┌─ Agent: subagent_type="general-purpose"
│  prompt="agents/09-システム開発部/ao.md と
│          workflows/tdd/tdd-rules.md を読んで
│          Task #010 認証API を TDD で実装"
│
├─ Agent: subagent_type="general-purpose"
│  prompt="agents/09-システム開発部/riku.md と
│          workflows/tdd/tdd-rules.md を読んで
│          Task #011 ログインUI を TDD で実装"
│
└─ Agent: subagent_type="general-purpose"
   prompt="agents/09-システム開発部/kuu.md を読んで
           Task #002 CI/CD pipeline を構築"
```

3つが同時に動く → 完了したものから kai が回収。

---

## 📋 実装の必須プロセス（各タスク）

### 1. ブランチ作成

```bash
git checkout -b feature/task-XXX-{短い説明}
```

### 2. TDD サイクル（必須）

`workflows/tdd/tdd-rules.md` を完全に守る：

```
RED:    失敗するテストを先に書く
        ↓
GREEN:  最小限のコードでテストを通す
        ↓
REFACTOR: テストを通したまま整理
        ↓
コミット
```

### 3. コミット規約（Conventional Commits）

```
feat: 新機能（ユーザー価値あり）
fix: バグ修正
test: テストのみの変更
refactor: 機能変更なしのリファクタ
docs: ドキュメント
chore: ビルド・依存関係
perf: パフォーマンス改善
```

例: `feat(auth): add login endpoint with rate limiting`

### 4. コード品質ルール

#### 必須
- [ ] **TypeScript strict mode** で型エラーゼロ
- [ ] **ESLint** エラーゼロ
- [ ] **Prettier** フォーマット適用
- [ ] **ユニットテスト** カバレッジ80%以上
- [ ] **JSDoc** が公開APIに記載されている
- [ ] **マジックナンバー禁止**（定数化）
- [ ] **エラーハンドリング** が全ての非同期処理に存在

#### 推奨
- 関数は **20行以内**
- 引数は **3つ以内**（多い場合はオブジェクト化）
- ネストは **3段以内**
- 1ファイル **300行以内**

### 5. レビュー観点

実装者自身でセルフレビュー：

- [ ] 設計書通りの構造になっているか
- [ ] 受け入れ基準（Given-When-Then）を全て満たすか
- [ ] エラーケースのテストが書かれているか
- [ ] パフォーマンス要件を満たすか
- [ ] セキュリティ脆弱性がないか（XSS / SQL Injection / 認証不備）
- [ ] アクセシビリティ（ARIA・キーボード操作）

### 6. PR作成

```markdown
## 概要
このPRが何を解決するか

## 変更内容
- 機能X追加
- バグYを修正

## テスト
- [ ] ユニットテスト追加（カバレッジ XX%）
- [ ] 統合テスト追加
- [ ] 手動テスト完了

## チェックリスト
- [ ] checklists/dev-completion.md を全て満たした
- [ ] 関連ドキュメント更新
- [ ] マイグレーション必要な場合は記載

## スクリーンショット
（UIなら）

## 関連Issue
Closes #XXX
```

### 7. 完了条件

`checklists/dev-completion.md` を Read して全項目チェック。

---

## 🛠️ 各エージェントの実装範囲

### Riku（フロントエンド）
- React コンポーネント実装
- Tailwind CSS でスタイリング
- API クライアント（fetch / TanStack Query）
- フォームバリデーション（Zod + React Hook Form）
- アクセシビリティ対応
- レスポンシブ対応
- ユニットテスト + コンポーネントテスト

### Ao（バックエンド）
- API エンドポイント実装
- DB Schema + マイグレーション
- 認証・認可ロジック
- ビジネスロジック
- 入力検証（Zod）
- エラーハンドリング
- ユニットテスト + 統合テスト

### Kuu（インフラ）
- GitHub Actions CI/CD
- Vercel 設定（環境変数・ドメイン）
- DB マイグレーション自動化
- 監視・ログ収集
- セキュリティスキャン

---

## 🚨 アンチパターン

❌ テストを後で書く（→ 結局書かない / 設計が悪くなる）
❌ TDD を「面倒」と言ってスキップ
❌ コミットを巨大にする（レビュー困難）
❌ 設計書から外れた実装（要件ズレが発生）
❌ エラーハンドリングなし（本番で爆発）

---

## 📤 出力

- マージ済み PR
- カバレッジレポート
- 各タスクの完了報告 → kai に集約

→ 次は STEP 5: QAテスト（mio が `checklists/qa-gate.md` でゲート判定）
