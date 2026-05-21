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
    <main className="mx-auto max-w-xl px-4 py-12">
      <div className="card p-6">
        <div className="text-center">
          <span className="badge bg-emerald-100 text-emerald-700">
            お申し込み完了
          </span>
          <h1 className="mt-3 text-xl font-bold text-slate-900">
            ご予約ありがとうございます
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {reservation.name} 様のお申し込みを受け付けました。
          </p>
        </div>

        <dl className="mt-6 space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
          <Row label="イベント" value={event.title} />
          <Row label="開催日時" value={formatDateTime(event.event_date)} />
          {event.venue && <Row label="会場" value={event.venue} />}
          <Row label="参加人数" value={`${reservation.quantity}名`} />
          <Row
            label="お支払い方法"
            value={paymentTypeLabel(reservation.payment_type)}
          />
          <Row label="お支払い金額" value={formatYen(total)} highlight />
        </dl>

        {reservation.payment_type === 'advance' ? (
          <div className="mt-5 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <p className="font-semibold text-slate-800">
              お振込みのご案内（事前振込）
            </p>
            <p className="mt-1 text-slate-600">
              下記のお振込先に、参加費 {formatYen(total)} をお振込みください。
              ご入金の確認をもって予約が確定します。
            </p>
            {event.bank_info ? (
              <pre className="mt-3 whitespace-pre-wrap rounded-md bg-white p-3 font-sans text-slate-700">
                {event.bank_info}
              </pre>
            ) : (
              <p className="mt-3 text-slate-500">
                ※お振込先は主催者よりメールでご案内します。
              </p>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              当日のお支払いについて
            </p>
            <p className="mt-1">
              参加費 {formatYen(total)} は、当日の受付でお支払いください。
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="btn-outline">
            イベント一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
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
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={
          highlight
            ? 'font-bold text-brand'
            : 'text-right font-medium text-slate-800'
        }
      >
        {value}
      </dd>
    </div>
  );
}
