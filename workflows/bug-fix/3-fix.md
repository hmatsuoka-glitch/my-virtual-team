# Bug Fix - STEP 3: Fix（修正実施）

**担当**: 該当する実装担当エージェント
**前段**: STEP 2 解析
**後段**: STEP 4 検証

---

## 🎯 目的

**再発防止テスト付き**で根本原因を解消する。

---

## 📋 修正のTDDプロセス

### 1. 失敗するテストを先に書く（必須）

「このバグが起きる状態」を再現するテストを書く：

```typescript
describe('Bug #123: ログインできない', () => {
  it('JWT_SECRET 環境変数なしの場合、起動時にエラーで止まる', () => {
    delete process.env.JWT_SECRET;
    expect(() => initApp()).toThrow('JWT_SECRET is required');
  });

  it('正常な環境変数で起動 → ログイン成功する', async () => {
    process.env.JWT_SECRET = 'test-secret';
    initApp();
    const res = await fetch('/api/auth/login', { /* ... */ });
    expect(res.status).toBe(200);
  });
});
```

このテストは**最初は必ず失敗する**（バグがある状態）。

### 2. 根本原因を修正

```typescript
// app/init.ts
export function initApp() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required. Check .env.example.');
  }
  // ...
}
```

### 3. テストが通ることを確認

```bash
npm test
# ✅ Bug #123: ログインできない (2 tests passed)
```

### 4. 関連する全テストを実行

```bash
npm run test:all
# 既存テストが壊れていないことを確認
```

### 5. ブランチ・コミット規約

```bash
git checkout -b fix/bug-123-jwt-secret-missing
```

```
fix(auth): require JWT_SECRET env var at startup

Bug #123: ログイン失敗の根本原因対応
- 環境変数なしで起動時に明示エラー
- 環境変数同期チェックを CI に追加

Closes #123
```

---

## 📋 修正完了レポート

```markdown
# Bug #XXX 修正完了レポート

## 修正内容
- ファイル: app/init.ts
- 変更点: 環境変数の存在チェックを起動時に追加

## 追加したテスト
- tests/init.test.ts に 2 件追加
- E2E: tests/e2e/auth.spec.ts に再現シナリオ追加

## 関連変更
- .github/workflows/ci.yml: 環境変数同期チェック追加
- README.md: セットアップ手順の環境変数説明を強化

## PR
- #XXX

## 残課題
（あれば）
```

---

## ✅ 修正完了の判定基準

- [ ] バグを再現するテストを書いた（最初は失敗）
- [ ] そのテストが通るように修正した
- [ ] 既存テストが全て通る
- [ ] CIが緑
- [ ] 関連ドキュメント更新

→ 次は STEP 4: 検証（`workflows/bug-fix/4-verify.md`）
