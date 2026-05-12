# STEP 2: 設計（Design / Architecture）

**担当**: Nao（システム開発部・要件定義/アーキテクト）
**前段**: STEP 1 要件定義
**後段**: STEP 3 タスク分解

---

## 🎯 目的

要件をシステムに落とし込む。**実装者が迷わずコードを書ける粒度まで分解する。**

---

## 📋 設計書の必須セクション

### 1. システム構成図

```
[ユーザー]
   ↓
[Vercel Edge / CDN]
   ↓
[Next.js (App Router)]
   ├─ app/(public)     ← 公開ページ
   ├─ app/(auth)       ← 認証必須ページ
   └─ app/api          ← API Routes
   ↓
[Supabase / PostgreSQL]
```

技術スタックを明示：
- **Frontend**: Next.js 15 (App Router) + React 19 + Tailwind CSS
- **Backend**: Next.js API Routes / Hono on Vercel Functions
- **DB**: Supabase (PostgreSQL) + Row Level Security
- **Auth**: Supabase Auth / Auth.js
- **Infra**: Vercel + GitHub Actions
- **Test**: Vitest + Playwright + Testing Library

### 2. ディレクトリ構成

```
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   └── api/
├── components/
│   ├── ui/             ← shadcn/ui等の基礎部品
│   └── features/       ← 機能別コンポーネント
├── lib/
│   ├── db/             ← DB接続
│   ├── auth/           ← 認証
│   └── utils/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

### 3. データベース設計

**ER図** + 各テーブル定義：

```sql
-- users テーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
```

**必須項目:**
- テーブルごとの主キー・外部キー
- インデックス戦略
- 制約（CHECK / UNIQUE / NOT NULL）
- RLS（Row Level Security）ポリシー

### 4. API設計

各エンドポイントを定義：

```
POST /api/auth/login
  Request:
    Content-Type: application/json
    Body: { email: string, password: string }
  Response 200:
    { token: string, user: User }
  Response 401:
    { error: "invalid_credentials" }
  Response 429:
    { error: "rate_limited", retry_after: number }
```

**必須項目:**
- リクエスト/レスポンスのスキーマ（Zod型推奨）
- 認証要件
- エラーレスポンス全網羅
- レート制限

### 5. 画面設計

**画面遷移図** + 各画面のワイヤーフレーム or 説明：

```
[ログイン] → [ダッシュボード] → [プロジェクト一覧]
                ↓                    ↓
          [プロフィール]        [プロジェクト詳細]
```

各画面で：
- 主要コンポーネント
- API呼び出し
- ローディング/エラー状態
- レスポンシブ対応

### 6. セキュリティ設計

- **認証**: 何で認証するか（OAuth/Email-Password/Magic Link）
- **認可**: ロールベース vs リソースベース
- **入力検証**: Zod でスキーマ検証
- **XSS対策**: React のエスケープ + DOMPurify
- **CSRF対策**: SameSite Cookie / トークン
- **SQL Injection対策**: ORM/Prepared Statement
- **シークレット管理**: 環境変数 + Vercel Secrets

### 7. テスト戦略

| 種類 | カバレッジ目標 | ツール | 担当 |
|------|--------------|--------|------|
| Unit | 80%+ | Vitest | riku/ao |
| Integration | 主要API全網羅 | Vitest + msw | ao |
| E2E | 主要ユーザーフロー | Playwright | mio |

### 8. デプロイ戦略

- **環境**: dev / staging / production
- **CI/CD**: GitHub Actions → Vercel
- **マイグレーション**: Supabase CLI で自動適用
- **ロールバック手順**: vercel rollback

---

## ✅ 設計完了の判定基準

`checklists/architect-checklist.md` で全項目チェック → 通過したら次STEP。

---

## 🚨 アンチパターン

❌ ER図なしでテーブルだけ定義（関連性が分からない）
❌ APIスキーマを「あとで決める」（実装で詰まる）
❌ エラーレスポンスを書かない（実装者が独自実装してバラバラに）
❌ テスト戦略を考えない（後でテスト書けない設計になる）

---

## 📤 出力

**ファイル**: `design.md` + `architecture.png`（図）

→ 次は STEP 3: タスク分解（`workflows/spec-driven/3-tasks.md`）
