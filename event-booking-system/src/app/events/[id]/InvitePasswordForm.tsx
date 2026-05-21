'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { unlockEventAction } from '@/app/actions/invite';

export default function InvitePasswordForm({
  eventId,
  title,
}: {
  eventId: number;
  title: string;
}) {
  const [state, formAction, pending] = useActionState(unlockEventAction, {});

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="card p-6">
        <span className="badge bg-purple-100 text-purple-700">
          完全招待制イベント
        </span>
        <h1 className="mt-2 text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          このイベントは招待された方のみご参加いただけます。主催者から共有された招待パスワードを入力してください。
        </p>

        <form action={formAction} className="mt-5 space-y-3">
          <input type="hidden" name="eventId" value={eventId} />
          <div>
            <label className="label" htmlFor="invite-password">
              招待パスワード
            </label>
            <input
              id="invite-password"
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
          <button type="submit" className="btn-primary w-full" disabled={pending}>
            {pending ? '確認中...' : 'イベントを表示する'}
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">
        <Link href="/" className="hover:underline">
          イベント一覧へ戻る
        </Link>
      </p>
    </main>
  );
}
