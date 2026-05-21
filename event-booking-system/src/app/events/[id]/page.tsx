import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEvent } from '@/lib/events';
import { reservedSeats } from '@/lib/reservations';
import { hasInviteAccess } from '@/lib/invite';
import { formatDateTime, formatYen } from '@/lib/format';
import EventRegisterForm from './EventRegisterForm';
import InvitePasswordForm from './InvitePasswordForm';

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEvent(Number(id));
  if (!event || event.status !== 'published') notFound();

  if (event.is_invite_only) {
    const allowed = await hasInviteAccess(event.id, event.invite_password);
    if (!allowed) {
      return <InvitePasswordForm eventId={event.id} title={event.title} />;
    }
  }

  const remaining =
    event.capacity > 0 ? event.capacity - reservedSeats(event.id) : null;
  const soldOut = remaining !== null && remaining <= 0;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm text-slate-500 hover:underline">
        ← イベント一覧へ
      </Link>

      <article className="mt-4 card overflow-hidden">
        {event.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.images[0]}
            alt={event.title}
            className="aspect-[16/9] w-full object-cover"
          />
        )}

        <div className="p-6">
          {event.is_invite_only && (
            <span className="badge bg-purple-100 text-purple-700">
              完全招待制イベント
            </span>
          )}
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {event.title}
          </h1>

          <dl className="mt-4 space-y-1 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">開催日時：</span>
              {formatDateTime(event.event_date)}
            </div>
            {event.venue && (
              <div>
                <span className="font-semibold text-slate-800">会場：</span>
                {event.venue}
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-800">参加費：</span>
              事前振込 {formatYen(event.price_advance)} ／ 当日払い{' '}
              {formatYen(event.price_door)}
            </div>
            {remaining !== null && (
              <div>
                <span className="font-semibold text-slate-800">残席：</span>
                {soldOut ? '満席' : `${remaining}名`}
              </div>
            )}
          </dl>

          {event.description && (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {event.description}
            </p>
          )}

          {event.images.length > 1 && (
            <div className="mt-5 grid grid-cols-3 gap-2">
              {event.images.slice(1).map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img}
                  src={img}
                  alt={event.title}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </article>

      <section className="mt-6 card p-6">
        <h2 className="text-lg font-bold text-slate-900">お申し込み</h2>
        {soldOut ? (
          <p className="mt-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            このイベントは満席のため、受付を終了しました。
          </p>
        ) : (
          <div className="mt-4">
            <EventRegisterForm
              eventId={event.id}
              priceAdvance={event.price_advance}
              priceDoor={event.price_door}
            />
          </div>
        )}
      </section>
    </main>
  );
}
