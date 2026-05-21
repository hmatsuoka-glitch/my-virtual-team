import Link from 'next/link';
import AdminShell from './AdminShell';
import { listAllEvents } from '@/lib/events';
import { getEventStats } from '@/lib/reservations';
import { formatDateTime, formatYen } from '@/lib/format';

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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">イベント一覧</h1>
        <Link href="/admin/events/new" className="btn-primary">
          + 新規イベント作成
        </Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="登録イベント数" value={`${events.length}件`} />
        <SummaryCard label="累計予約数" value={`${totalReservations}件`} />
        <SummaryCard
          label="入金確認済み / 見込み売上"
          value={`${formatYen(totalConfirmed)} / ${formatYen(totalExpected)}`}
        />
      </div>

      {events.length === 0 ? (
        <div className="mt-6 card p-12 text-center text-slate-500">
          まだイベントがありません。「新規イベント作成」から登録してください。
        </div>
      ) : (
        <div className="mt-6 card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="px-4 py-3">イベント名</th>
                <th className="px-4 py-3">開催日時</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3 text-right">予約 / 残席</th>
                <th className="px-4 py-3 text-right">入金 / 見込み</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ event, stats }) => (
                <tr
                  key={event.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {event.title}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDateTime(event.event_date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {event.status === 'published' ? (
                        <span className="badge bg-emerald-100 text-emerald-700">
                          公開中
                        </span>
                      ) : (
                        <span className="badge bg-slate-200 text-slate-600">
                          下書き
                        </span>
                      )}
                      {Boolean(event.is_invite_only) && (
                        <span className="badge bg-purple-100 text-purple-700">
                          招待制
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {stats.reservedSeats}名
                    {stats.remainingSeats !== null && (
                      <span className="text-slate-400">
                        {' '}
                        / 残{stats.remainingSeats}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    <span className="font-semibold text-slate-900">
                      {formatYen(stats.confirmedRevenue)}
                    </span>
                    <span className="text-slate-400">
                      {' '}
                      / {formatYen(stats.expectedRevenue)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
