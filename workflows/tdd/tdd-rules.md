# TDD (Test-Driven Development) 強制ルール

**全実装エージェント（riku / ao / kuu）が必ず守るルール**

このファイルはTDDを強制する番人（TDD Guard）の役割を果たす。
コードを書く前に必ずこのファイルを Read すること。

---

## 🔴🟢🔵 TDDの3ステップ（厳守）

### 🔴 RED: 失敗するテストを先に書く

```typescript
// 1. まずテストを書く（実装はまだない）
import { describe, it, expect } from 'vitest';
import { calculateTotal } from './calculator';

describe('calculateTotal', () => {
  it('items の合計金額を返す', () => {
    const items = [
      { price: 100, quantity: 2 },
      { price: 200, quantity: 1 },
    ];
    expect(calculateTotal(items)).toBe(400);
  });
});

// 2. 実行 → 失敗することを確認（RED）
//    Error: calculateTotal is not defined
```

**RED段階で必ず確認:**
- [ ] テストが**失敗する**ことを確認した
- [ ] エラーメッセージが「実装がない」ことを示している
- [ ] テストが「スキップ」ではない

### 🟢 GREEN: 最小限のコードでテストを通す

```typescript
// calculator.ts
export function calculateTotal(items: { price: number; quantity: number }[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// テスト実行 → ✅ 通過（GREEN）
```

**GREEN段階のルール:**
- [ ] 最小限の実装に留める（過剰実装禁止）
- [ ] 「テストが通る」だけが目的（綺麗さは後）
- [ ] コピペでもOK（リファクタは次のステップ）

### 🔵 REFACTOR: テストを通したまま整理

```typescript
// calculator.ts（リファクタ後）
type LineItem = { price: number; quantity: number };

export function calculateTotal(items: LineItem[]): number {
  return items
    .map(itemSubtotal)
    .reduce(sum, 0);
}

const itemSubtotal = (item: LineItem) => item.price * item.quantity;
const sum = (a: number, b: number) => a + b;

// テスト実行 → ✅ 引き続き通過
```

**REFACTOR段階のルール:**
- [ ] テストを毎回実行して GREEN を保つ
- [ ] 機能を変えない（テストを書き換えない）
- [ ] 命名・型・構造を整理

---

## 🚫 TDD違反の検出（やってはいけないこと）

以下の行動は**TDD違反**として実装エージェントが自分で停止し、kai に報告すること。

### 違反パターン1: 実装を先に書く
```
❌ 違反: いきなり .ts ファイルに関数を書く
⭕ 正解: 先に .test.ts を書く
```

### 違反パターン2: テストをスキップ・削除
```
❌ 違反: it.skip(...) や it.todo(...) を残す
⭕ 正解: 全テストが実行され、PASSする
```

### 違反パターン3: テストを後付けする
```
❌ 違反: 機能完成後に「カバレッジのため」のテストを追加
⭕ 正解: 機能のテストを先に書いて、それに従って実装
```

### 違反パターン4: 過剰実装（GREEN段階で）
```
❌ 違反: テストにない機能まで実装してしまう
⭕ 正解: 必要なテストを追加してから実装する
```

### 違反パターン5: テストを書き換えて通す
```
❌ 違反: テストが失敗 → テストの方を期待値に合わせる
⭕ 正解: 実装が間違っているのでテストの期待値が正しい
```

---

## 📊 テストの種類と書く順序

### 1. ユニットテスト（必須・最初に書く）

```typescript
// 純粋関数・ロジックの単体テスト
describe('validateEmail', () => {
  it.each([
    ['user@example.com', true],
    ['invalid', false],
    ['', false],
    ['a@b', false],
  ])('「%s」 → %s', (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });
});
```

### 2. コンポーネントテスト（FE実装時）

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('email と password を入力して送信できる', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('パスワード'), 'pass1234');
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass1234',
    });
  });
});
```

### 3. 統合テスト（API実装時）

```typescript
describe('POST /api/auth/login', () => {
  it('正しい認証情報で200を返す', async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'valid' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
  });

  it('間違ったパスワードで401を返す', async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
    });
    expect(res.status).toBe(401);
  });
});
```

### 4. E2Eテスト（mio が QA 段階で書く）

```typescript
import { test, expect } from '@playwright/test';

test('ログインフロー', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'valid');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## ✅ TDD Done条件（各タスク完了時）

実装者が自分でチェック：

- [ ] テストファイルを実装ファイルより先に作成した
- [ ] 各テストで RED → GREEN → REFACTOR を回した
- [ ] カバレッジ 80% 以上
- [ ] エッジケースのテストがある（null / 空 / 境界値 / 異常系）
- [ ] テストが「実行可能・PASS・スキップなし」
- [ ] CI でテストが緑になっている

→ `checklists/tdd-checklist.md` で最終確認

---

## 🛡️ TDD Guard 自動検出（推奨設定）

`.claude/settings.json` に hooks を設定して、TDD違反を自動検出：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "tdd-guard check"
          }
        ]
      }
    ]
  }
}
```

これにより、テストなしの実装を Claude が書こうとすると **ブロック** される。

---

## 🎯 TDDのメリット（なぜ守るのか）

1. **設計が良くなる**: テストしやすいコード = 疎結合・単一責任
2. **デグレ検出**: 既存テストが壊れたら即座に分かる
3. **リファクタの安心感**: テストがあれば大胆に整理できる
4. **要件の明確化**: テストが「仕様」そのものになる
5. **デバッグ時間の劇的短縮**: 問題箇所がテストで特定できる

---

**このルールに違反した実装は、Mio のQAゲートで必ず差し戻される。**
