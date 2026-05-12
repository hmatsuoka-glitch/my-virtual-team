# TDD Checklist（TDD遵守チェック）

**担当**: 各実装エージェント（自己チェック）+ Mio（QAでの最終確認）
**使用タイミング**: 各タスクのコミット前・PR作成前

`workflows/tdd/tdd-rules.md` の遵守を確認するチェックリスト。

---

## 🔴 RED フェーズ確認

- [ ] **テストファイルを実装ファイルより先に作成した**
- [ ] テスト実行 → 失敗することを目視確認した
- [ ] 失敗の理由が「実装が存在しない/不完全」と分かるエラー
- [ ] テストの assertion が具体的（`toBeTruthy()` のような曖昧でない）

## 🟢 GREEN フェーズ確認

- [ ] 最小限の実装でテストが通る
- [ ] テスト対象以外の機能を実装していない
- [ ] テストが通ることを CI でも確認した

## 🔵 REFACTOR フェーズ確認

- [ ] リファクタ前後でテストが全て通る
- [ ] 機能を変更していない（テストを書き換えていない）
- [ ] 命名・型・構造が改善されている

## 📝 テストの内容

- [ ] **正常系テスト** がある
- [ ] **異常系テスト** がある（エラー・例外）
- [ ] **境界値テスト** がある（最小・最大・空・null・1個・大量）
- [ ] **エッジケーステスト** がある（特殊文字・絵文字・大きな数値・小数）

## 🚫 違反の検出

以下が発生していたら **TDD違反** として差し戻し：

- [ ] テストなしで実装ファイルだけ存在 → ❌
- [ ] `it.skip()` `it.todo()` `xit()` `describe.skip()` が残っている → ❌
- [ ] `console.log` がテストに残っている → ❌
- [ ] テスト実行をスキップする設定（`--passWithNoTests` の常用等） → ❌
- [ ] カバレッジが80%未満 → ❌
- [ ] テストが「実装の真似」になっている → ❌

### 「実装の真似」の例

```typescript
// ❌ 悪い例：実装の構造をそのままテストにしている
describe('UserService', () => {
  it('createUser を呼ぶと内部の repo.save が呼ばれる', () => {
    const repo = { save: vi.fn() };
    const service = new UserService(repo);
    service.createUser({ /* ... */ });
    expect(repo.save).toHaveBeenCalled();  // 実装の詳細にロックインされている
  });
});

// ⭕ 良い例：振る舞いをテストしている
describe('UserService', () => {
  it('新規ユーザー作成後、ユーザー一覧で取得できる', async () => {
    const service = new UserService(new InMemoryRepo());
    await service.createUser({ name: 'Alice', email: 'a@b.com' });
    const users = await service.listUsers();
    expect(users).toContainEqual(expect.objectContaining({ name: 'Alice' }));
  });
});
```

## 🛡️ TDD Guard 動作確認（推奨設定時）

- [ ] `.claude/settings.json` の hooks が動いている
- [ ] テストなしで実装を書こうとした際にブロックされた
- [ ] エラーメッセージが TDD違反を示している

## 📊 カバレッジ確認

- [ ] Unit カバレッジ: 80%+
- [ ] Branch カバレッジ: 70%+
- [ ] 主要なビジネスロジックは 90%+
- [ ] カバレッジレポートをPRに添付

## ✅ 全項目クリアの場合

→ `checklists/dev-completion.md` の確認 → PR 作成

## ❌ 違反があった場合

```
1. 該当箇所を修正（テストを先に書き直す）
2. RED → GREEN → REFACTOR を再実行
3. このチェックリストを再度確認
```
