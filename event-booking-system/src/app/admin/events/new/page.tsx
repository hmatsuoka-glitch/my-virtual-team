import Link from 'next/link';
import AdminShell from '@/app/admin/AdminShell';
import EventForm from '@/app/admin/EventForm';
import { createEventAction } from '@/app/actions/events';

export const dynamic = 'force-dynamic';

export default function NewEventPage() {
  return (
    <AdminShell>
      <Link
        href="/admin"
        className="text-[10px] uppercase tracking-widest text-muted transition hover:text-gold"
      >
        ← Dashboard
      </Link>
      <div className="mb-7 mt-3">
        <p className="eyebrow">New Event</p>
        <h1 className="mt-2 text-3xl text-cream">新規イベント作成</h1>
      </div>
      <EventForm mode="create" action={createEventAction} />
    </AdminShell>
  );
}
