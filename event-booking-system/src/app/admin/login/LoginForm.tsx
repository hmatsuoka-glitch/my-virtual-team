'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="card p-9">
          <div className="text-center">
            <span className="font-display text-lg tracking-[0.4em] text-cream">
              ÉVÉNEMENTS
            </span>
            <p className="eyebrow mt-3">Organizer Access</p>
          </div>
          <div className="mx-auto my-7 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />

          <form action={formAction} className="space-y-4">
            <div>
              <label className="label" htmlFor="login-password">
                Password
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
              <p className="text-xs tracking-wide text-red-300">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              className="btn-gold w-full"
              disabled={pending}
            >
              {pending ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
