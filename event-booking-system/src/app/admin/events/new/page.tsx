import Link from 'next/link';
import AdminShell from '@/app/admin/AdminShell';
import EventForm from '@/app/admin/EventForm';
import { createEventAction } from '@/app/actions/events';

export const dynamic = 'force-dynamic';

export default function NewEventPage() {
  return (
    <AdminShell>
      <Link href="/admin" className="text-sm text-slate-500 hover:underline">
        ← イベント一覧へ
      </Link>
      <h1 className="mt-2 mb-6 text-xl font-bold text-slate-900">
        新規イベント作成
      </h1>
      <EventForm mode="create" action={createEventAction} />
    </AdminShell>
  );
}
