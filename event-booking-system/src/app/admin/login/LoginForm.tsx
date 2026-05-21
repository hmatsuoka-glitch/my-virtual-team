'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <div className="card p-6">
        <h1 className="text-lg font-bold text-slate-900">
          管理画面にログイン
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          イベント予約システムの管理者用ログインです。
        </p>

        <form action={formAction} className="mt-5 space-y-3">
          <div>
            <label className="label" htmlFor="login-password">
              パスワード
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoFocus
              className="field"
            />
          </div>
          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={pending}
          >
            {pending ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </main>
  );
}
