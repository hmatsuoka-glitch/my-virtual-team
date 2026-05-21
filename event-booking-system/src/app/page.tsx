import Link from 'next/link';
import { listPublicEvents } from '@/lib/events';
import { reservedSeats } from '@/lib/reservations';
import { formatDateShort, formatYen } from '@/lib/format';

export const dynamic = 'force-dynamic';

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="4.5" y="10.5" width="15" height="10" rx="1" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
      <circle cx="12" cy="15" r="1.4" />
    </svg>
  );
}

export default function HomePage() {
  const events = listPublicEvents();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-6">
          <span className="font-display text-lg tracking-[0.4em] text-cream">
            ÉVÉNEMENTS
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-12 pt-20 text-center">
        <p className="eyebrow">Exclusive Gatherings</p>
        <h1 className="mt-5 text-4xl leading-tight text-cream sm:text-6xl">
          開催予定のイベント
        </h1>
        <p className="mt-5 text-sm tracking-wide text-muted">
          特別な夜へ、ご招待します。ご希望のイベントをお選びください。
        </p>
        <div className="mx-auto mt-9 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </section>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {events.length === 0 ? (
          <div className="card p-16 text-center text-sm tracking-wide text-muted">
            現在、公開中のイベントはありません。
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {events.map((event) => {
              const invite = Boolean(event.is_invite_only);
              const remaining =
                !invite && event.capacity > 0
                  ? event.capacity - reservedSeats(event.id)
                  : null;
              const soldOut = remaining !== null && remaining <= 0;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group card overflow-hidden transition duration-300 hover:border-gold/50"
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-ink">
                    {event.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.images[0]}
                        alt={event.title}
                        className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
                          invite ? 'blur-md brightness-[0.4]' : 'brightness-90'
                        }`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-surface2 to-noir text-[10px] uppercase tracking-widest text-muted/40">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/15 to-transparent" />

                    {invite && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gold">
                        <LockIcon className="h-8 w-8" />
                        <span className="eyebrow">Invitation Only</span>
                      </div>
                    )}

                    <div className="absolute left-5 top-5">
                      {soldOut ? (
                        <span className="badge-muted">Sold Out</span>
                      ) : !invite && remaining !== null ? (
                        <span className="badge-gold">残り {remaining} 席</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-7">
                    <p className="eyebrow">
                      {formatDateShort(event.event_date)}
                    </p>
                    <h2 className="mt-3 text-2xl leading-snug text-cream">
                      {event.title}
                    </h2>

                    {invite ? (
                      <p className="mt-4 flex items-center gap-2 text-xs tracking-wide text-muted">
                        <LockIcon className="h-3.5 w-3.5 text-gold" />
                        詳細・ご予約には招待コードが必要です
                      </p>
                    ) : (
                      <>
                        {event.venue && (
                          <p className="mt-2 text-sm tracking-wide text-muted">
                            {event.venue}
                          </p>
                        )}
                        <div className="mt-5 h-px w-full bg-line" />
                        <p className="mt-4 text-sm text-cream">
                          <span className="text-muted">事前</span>{' '}
                          {formatYen(event.price_advance)}
                          <span className="mx-2.5 text-line">|</span>
                          <span className="text-muted">当日</span>{' '}
                          {formatYen(event.price_door)}
                        </p>
                      </>
                    )}

                    <span className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-gold transition group-hover:gap-3">
                      {invite ? 'View Invitation' : 'View Details'}
                      <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-9 text-center">
          <Link
            href="/admin"
            className="text-[10px] uppercase tracking-widest text-muted transition hover:text-gold"
          >
            Organizer Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
