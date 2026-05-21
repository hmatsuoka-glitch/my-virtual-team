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
      <Link href="/admin" className="text-sm text-slate-500 hover:underline">
        ← イベント一覧へ
      </Link>
      <h1 className="mt-2 text-xl font-bold text-slate-900">{event.title}</h1>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <Stat label="予約数" value={`${stats.reservationCount}件`} />
        <Stat
          label="予約人数 / 残席"
          value={
            stats.remainingSeats !== null
              ? `${stats.reservedSeats}名 / 残${stats.remainingSeats}`
              : `${stats.reservedSeats}名`
          }
        />
        <Stat
          label="入金確認済み売上"
          value={formatYen(stats.confirmedRevenue)}
        />
        <Stat label="見込み売上" value={formatYen(stats.expectedRevenue)} />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-slate-900">予約者管理</h2>
        <ReservationTable event={event} reservations={reservations} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-slate-900">
          イベント情報の編集
        </h2>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}
