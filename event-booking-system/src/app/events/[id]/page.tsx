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
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <Link
            href="/"
            className="font-display text-base tracking-[0.4em] text-cream"
          >
            ÉVÉNEMENTS
          </Link>
          <Link
            href="/"
            className="text-[10px] uppercase tracking-widest text-muted transition hover:text-gold"
          >
            ← All Events
          </Link>
        </div>
      </header>

      <div className="relative">
        <div className="aspect-[21/9] w-full overflow-hidden bg-ink">
          {event.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.images[0]}
              alt={event.title}
              className="h-full w-full object-cover brightness-[0.55]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-b from-surface2 to-noir" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-5xl px-6 pb-10">
            {Boolean(event.is_invite_only) && (
              <span className="badge-gold mb-4">Invitation Only</span>
            )}
            <p className="eyebrow">{formatDateTime(event.event_date)}</p>
            <h1 className="mt-3 text-4xl leading-tight text-cream sm:text-5xl">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {event.description ? (
              <section>
                <p className="eyebrow">About the Event</p>
                <div className="mt-4 hairline" />
                <p className="mt-6 whitespace-pre-wrap text-sm leading-loose tracking-wide text-cream/85">
                  {event.description}
                </p>
              </section>
            ) : (
              <p className="text-sm text-muted">
                イベントの詳細は近日公開予定です。
              </p>
            )}

            {event.images.length > 1 && (
              <section className="mt-12">
                <p className="eyebrow">Gallery</p>
                <div className="mt-4 hairline" />
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {event.images.slice(1).map((img) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={img}
                      src={img}
                      alt=""
                      className="aspect-square w-full object-cover transition duration-500 hover:brightness-110"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside>
            <div className="card p-7 lg:sticky lg:top-8">
              <p className="eyebrow">Details</p>
              <div className="mt-4 hairline" />
              <dl className="mt-6 space-y-4 text-sm">
                <Detail label="Date" value={formatDateTime(event.event_date)} />
                {event.venue && <Detail label="Venue" value={event.venue} />}
                <Detail
                  label="事前振込"
                  value={formatYen(event.price_advance)}
                />
                <Detail label="当日払い" value={formatYen(event.price_door)} />
                {remaining !== null && (
                  <Detail
                    label="残席"
                    value={soldOut ? 'Sold Out' : `${remaining} 席`}
                  />
                )}
              </dl>
              <a href="#register" className="btn-outline mt-7 w-full">
                お申し込みへ
              </a>
            </div>
          </aside>
        </div>

        <section id="register" className="mt-16 scroll-mt-8">
          <div className="text-center">
            <p className="eyebrow">Reservation</p>
            <h2 className="mt-3 text-3xl text-cream sm:text-4xl">
              お申し込み
            </h2>
            <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>

          <div className="mx-auto mt-10 max-w-2xl">
            {soldOut ? (
              <div className="card p-12 text-center text-sm tracking-wide text-muted">
                このイベントは満席のため、受付を終了しました。
              </div>
            ) : (
              <div className="card p-7 sm:p-9">
                <EventRegisterForm
                  eventId={event.id}
                  priceAdvance={event.price_advance}
                  priceDoor={event.price_door}
                />
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-9 text-center">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-widest text-muted transition hover:text-gold"
          >
            ← All Events
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
      <dt className="shrink-0 text-[11px] uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd className="text-right text-cream">{value}</dd>
    </div>
  );
}
