import Link from 'next/link';
import AdminShell from './AdminShell';
import { listAllEvents } from '@/lib/events';
import { getEventStats } from '@/lib/reservations';
import { formatDateShort, formatYen } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const events = listAllEvents();
  const rows = events.map((event) => ({
    event,
    stats: getEventStats(event),
  }));

  const totalExpected = rows.reduce((s, r) => s + r.stats.expectedRevenue, 0);
  const totalConfirmed = rows.reduce((s, r) => s + r.stats.confirmedRevenue, 0);
  const totalReservations = rows.reduce(
    (s, r) => s + r.stats.reservationCount,
    0,
  );

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 text-3xl text-cream">イベント一覧</h1>
        </div>
        <Link href="/admin/events/new" className="btn-gold">
          + 新規イベント作成
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="登録イベント数" value={`${events.length}`} unit="件" />
        <SummaryCard
          label="累計予約数"
          value={`${totalReservations}`}
          unit="件"
        />
        <SummaryCard
          label="入金確認済 / 見込み売上"
          value={formatYen(totalConfirmed)}
          unit={`/ ${formatYen(totalExpected)}`}
        />
      </div>

      {events.length === 0 ? (
        <div className="mt-8 card p-16 text-center text-sm tracking-wide text-muted">
          まだイベントがありません。「新規イベント作成」から登録してください。
        </div>
      ) : (
        <div className="mt-8 card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[10px] uppercase tracking-widest text-muted">
                <th className="px-5 py-4 font-medium">イベント名</th>
                <th className="px-5 py-4 font-medium">開催日時</th>
                <th className="px-5 py-4 font-medium">状態</th>
                <th className="px-5 py-4 text-right font-medium">
                  予約 / 残席
                </th>
                <th className="px-5 py-4 text-right font-medium">
                  入金 / 見込み
                </th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ event, stats }) => (
                <tr
                  key={event.id}
                  className="border-b border-line transition last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-4 font-medium text-cream">
                    {event.title}
                  </td>
                  <td className="px-5 py-4 text-xs uppercase tracking-wide text-muted">
                    {formatDateShort(event.event_date)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {event.status === 'published' ? (
                        <span className="badge border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                          公開中
                        </span>
                      ) : (
                        <span className="badge-muted">下書き</span>
                      )}
                      {Boolean(event.is_invite_only) && (
                        <span className="badge-gold">招待制</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right text-muted">
                    <span className="text-cream">{stats.reservedSeats}名</span>
                    {stats.remainingSeats !== null && (
                      <span> / 残{stats.remainingSeats}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right text-muted">
                    <span className="text-gold">
                      {formatYen(stats.confirmedRevenue)}
                    </span>
                    <span> / {formatYen(stats.expectedRevenue)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="btn-outline btn-sm"
                    >
                      管理
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

function SummaryCard({
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
      <p className="mt-2 font-display text-2xl text-cream">
        {value}
        {unit && (
          <span className="ml-1.5 text-sm text-muted">{unit}</span>
        )}
      </p>
    </div>
  );
}
