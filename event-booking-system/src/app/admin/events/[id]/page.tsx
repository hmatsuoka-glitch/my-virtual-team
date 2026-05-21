import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminShell from '@/app/admin/AdminShell';
import EventForm from '@/app/admin/EventForm';
import ReservationTable from './ReservationTable';
import { getEvent } from '@/lib/events';
import { listByEvent, getEventStats } from '@/lib/reservations';
import { updateEventAction, deleteEventAction } from '@/app/actions/events';
import { formatYen } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEvent(Number(id));
  if (!event) notFound();

  const reservations = listByEvent(event.id);
  const stats = getEventStats(event);

  return (
    <AdminShell>
      <Link
        href="/admin"
        className="text-[10px] uppercase tracking-widest text-muted transition hover:text-gold"
      >
        ← Dashboard
      </Link>
      <div className="mt-3">
        <p className="eyebrow">Manage Event</p>
        <h1 className="mt-2 text-3xl text-cream">{event.title}</h1>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-4">
        <Stat label="予約数" value={`${stats.reservationCount}`} unit="件" />
        <Stat
          label="予約人数 / 残席"
          value={
            stats.remainingSeats !== null
              ? `${stats.reservedSeats} / 残${stats.remainingSeats}`
              : `${stats.reservedSeats}`
          }
          unit="名"
        />
        <Stat
          label="入金確認済 売上"
          value={formatYen(stats.confirmedRevenue)}
        />
        <Stat label="見込み売上" value={formatYen(stats.expectedRevenue)} />
      </div>

      <section className="mt-12">
        <p className="eyebrow">Reservations</p>
        <h2 className="mb-4 mt-2 text-xl text-cream">予約者管理</h2>
        <ReservationTable event={event} reservations={reservations} />
      </section>

      <section className="mt-12">
        <p className="eyebrow">Edit</p>
        <h2 className="mb-4 mt-2 text-xl text-cream">イベント情報の編集</h2>
        <EventForm
          mode="edit"
          action={updateEventAction}
          event={event}
          deleteAction={deleteEventAction}
        />
      </section>
    </AdminShell>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-[10px] uppercase tracking-widest text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-xl text-cream">
        {value}
        {unit && <span className="ml-1 text-sm text-muted">{unit}</span>}
      </p>
    </div>
  );
}
