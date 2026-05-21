'use client';

import { useActionState, useState } from 'react';
import { createReservationAction } from '@/app/actions/reservations';
import { formatYen } from '@/lib/format';

export default function EventRegisterForm({
  eventId,
  priceAdvance,
  priceDoor,
}: {
  eventId: number;
  priceAdvance: number;
  priceDoor: number;
}) {
  const [state, formAction, pending] = useActionState(
    createReservationAction,
    {},
  );
  const [paymentType, setPaymentType] = useState<'advance' | 'door'>('advance');

  const options: {
    value: 'advance' | 'door';
    label: string;
    price: number;
    note: string;
  }[] = [
    {
      value: 'advance',
      label: '事前振込',
      price: priceAdvance,
      note: 'お申し込み後、指定口座へお振込みください（優待価格）',
    },
    {
      value: 'door',
      label: '当日払い',
      price: priceDoor,
      note: '当日、会場の受付にてお支払いください',
    },
  ];

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="eventId" value={eventId} />

      <div>
        <label className="label" htmlFor="reg-name">
          お名前 <span className="text-gold">*</span>
        </label>
        <input id="reg-name" name="name" required className="field" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="reg-email">
            メールアドレス <span className="text-gold">*</span>
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            required
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="reg-phone">
            電話番号
          </label>
          <input id="reg-phone" name="phone" className="field" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="reg-quantity">
          ご参加人数
        </label>
        <input
          id="reg-quantity"
          name="quantity"
          type="number"
          min={1}
          defaultValue={1}
          className="field max-w-[8rem]"
        />
      </div>

      <fieldset>
        <legend className="label">お支払い方法</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((opt) => {
            const selected = paymentType === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex cursor-pointer flex-col border p-4 transition ${
                  selected
                    ? 'border-gold bg-gold/10'
                    : 'border-line hover:border-gold/40'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment_type"
                      value={opt.value}
                      checked={selected}
                      onChange={() => setPaymentType(opt.value)}
                      className="accent-gold"
                    />
                    <span className="text-sm font-medium text-cream">
                      {opt.label}
                    </span>
                  </span>
                  <span className="font-display text-lg text-gold">
                    {formatYen(opt.price)}
                  </span>
                </span>
                <span className="mt-2 pl-6 text-[11px] leading-relaxed tracking-wide text-muted">
                  {opt.note}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label className="label" htmlFor="reg-note">
          ご連絡事項・備考
        </label>
        <textarea id="reg-note" name="note" rows={3} className="field" />
      </div>

      {state.error && (
        <p className="border border-red-500/40 bg-red-500/10 p-3 text-xs tracking-wide text-red-300">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-gold w-full" disabled={pending}>
        {pending ? '送信中...' : 'お申し込みを確定する'}
      </button>
    </form>
  );
}
