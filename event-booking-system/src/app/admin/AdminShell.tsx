import Link from 'next/link';
import type { ReactNode } from 'react';
import { logoutAction } from '@/app/actions/auth';

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-baseline gap-3">
            <span className="font-display text-base tracking-[0.35em] text-cream">
              ÉVÉNEMENTS
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gold">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/"
              target="_blank"
              className="text-[10px] uppercase tracking-widest text-muted transition hover:text-gold"
            >
              View Site
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="btn-ghost btn-sm">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
