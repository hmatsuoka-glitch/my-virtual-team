import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEvent } from '@/lib/events';
import { getReservation } from '@/lib/reservations';
import { formatDateTime, formatYen, paymentTypeLabel } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ReservationCompletePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ rid?: string }>;
}) {
  const { id } = await params;
  const { rid } = await searchParams;
  const event = getEvent(Number(id));
  const reservation = rid ? getReservation(Number(rid)) : null;

  if (!event || !reservation || reservation.event_id !== event.id) {
    notFound();
  }

  const unitPrice =
    reservation.payment_type === 'advance'
      ? event.price_advance
      : event.price_door;
  const total = unitPrice * reservation.quantity;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <div className="card p-9 sm:p-11">
          <div className="text-center">
            <p className="eyebrow">Reservation Confirmed</p>
            <h1 className="mt-4 text-3xl leading-snug text-cream">
              ご予約ありがとうございます
            </h1>
            <div className="mx-auto mt-5 h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <p className="mt-5 text-sm tracking-wide text-muted">
              {reservation.name} 様のお申し込みを承りました。
            </p>
          </div>

          <dl className="mt-8 space-y-4 border border-line p-6 text-sm">
            <Row label="Event" value={event.title} />
            <Row label="Date" value={formatDateTime(event.event_date)} />
            {event.venue && <Row label="Venue" value={event.venue} />}
            <Row label="人数" value={`${reservation.quantity} 名`} />
            <Row
              label="お支払い方法"
              value={paymentTypeLabel(reservation.payment_type)}
            />
            <Row label="お支払い金額" value={formatYen(total)} highlight />
          </dl>

          {reservation.payment_type === 'advance' ? (
            <div className="mt-6 border border-gold/30 bg-gold/5 p-6 text-sm">
              <p className="eyebrow">Bank Transfer</p>
              <p className="mt-3 leading-relaxed tracking-wide text-cream/85">
                下記のお振込先へ、参加費 {formatYen(total)}{' '}
                をお振込みください。ご入金の確認をもって、ご予約が確定いたします。
              </p>
              {event.bank_info ? (
                <pre className="mt-4 whitespace-pre-wrap border border-line bg-ink p-4 font-sans text-xs leading-relaxed text-cream">
                  {event.bank_info}
                </pre>
              ) : (
                <p className="mt-4 text-xs text-muted">
                  ※ お振込先は、主催者より別途メールにてご案内いたします。
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6 border border-line bg-ink p-6 text-sm">
              <p className="eyebrow">At-Door Payment</p>
              <p className="mt-3 leading-relaxed tracking-wide text-cream/85">
                参加費 {formatYen(total)}{' '}
                は、当日、会場の受付にてお支払いください。
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/" className="btn-outline">
              イベント一覧へ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
      <dt className="shrink-0 text-[11px] uppercase tracking-wider text-muted">
        {label}
      </dt>
      {highlight ? (
        <dd className="font-display text-xl text-gold">{value}</dd>
      ) : (
        <dd className="text-right text-cream">{value}</dd>
      )}
    </div>
  );
}
