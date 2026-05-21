import Link from 'next/link';
import { listPublicEvents } from '@/lib/events';
import { reservedSeats } from '@/lib/reservations';
import { formatDateTime, formatYen } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const events = listPublicEvents();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">開催予定のイベント</h1>
        <p className="mt-1 text-sm text-slate-500">
          ご希望のイベントを選んでお申し込みください。
        </p>
      </header>

      {events.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          現在、公開中のイベントはありません。
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {events.map((event) => {
            const remaining =
              event.capacity > 0
                ? event.capacity - reservedSeats(event.id)
                : null;
            const soldOut = remaining !== null && remaining <= 0;
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[16/9] bg-slate-100">
                  {event.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.images[0]}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-300">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-slate-900">{event.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDateTime(event.event_date)}
                  </p>
                  {event.venue && (
                    <p className="text-sm text-slate-500">
                      会場：{event.venue}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand">
                      事前 {formatYen(event.price_advance)} / 当日{' '}
                      {formatYen(event.price_door)}
                    </span>
                    {soldOut ? (
                      <span className="badge bg-red-100 text-red-700">
                        満席
                      </span>
                    ) : remaining !== null ? (
                      <span className="badge bg-emerald-100 text-emerald-700">
                        残り{remaining}名
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
        <Link href="/admin" className="hover:underline">
          主催者の方はこちら（管理画面）
        </Link>
      </footer>
    </main>
  );
}
