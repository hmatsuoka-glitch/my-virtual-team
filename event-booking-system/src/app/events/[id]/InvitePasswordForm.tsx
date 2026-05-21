'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { unlockEventAction } from '@/app/actions/invite';

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="4.5" y="10.5" width="15" height="10" rx="1" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
      <circle cx="12" cy="15" r="1.4" />
    </svg>
  );
}

export default function InvitePasswordForm({
  eventId,
  title,
}: {
  eventId: number;
  title: string;
}) {
  const [state, formAction, pending] = useActionState(unlockEventAction, {});

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="card p-10 text-center">
          <LockIcon className="mx-auto h-10 w-10 text-gold" />
          <p className="eyebrow mt-5">Invitation Only</p>
          <h1 className="mt-3 text-2xl leading-snug text-cream">{title}</h1>
          <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p className="mt-5 text-xs leading-relaxed tracking-wide text-muted">
            こちらは招待者限定のイベントです。
            <br />
            主催者よりお受け取りいただいた招待コードをご入力ください。
          </p>

          <form action={formAction} className="mt-7 space-y-4 text-left">
            <input type="hidden" name="eventId" value={eventId} />
            <div>
              <label className="label" htmlFor="invite-password">
                招待コード
              </label>
              <input
                id="invite-password"
                name="password"
                type="password"
                required
                autoFocus
                className="field text-center tracking-widest"
              />
            </div>
            {state.error && (
              <p className="text-center text-xs tracking-wide text-red-300">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              className="btn-gold w-full"
              disabled={pending}
            >
              {pending ? '確認中...' : 'イベントを表示する'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-widest text-muted transition hover:text-gold"
          >
            ← All Events
          </Link>
        </p>
      </div>
    </div>
  );
}
