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

  const options: { value: 'advance' | 'door'; label: string; price: number; note: string }[] = [
    {
      value: 'advance',
      label: '事前振込',
      price: priceAdvance,
      note: 'お申し込み後、指定口座へお振込みください（早割価格）',
    },
    {
      value: 'door',
      label: '当日払い',
      price: priceDoor,
      note: '当日会場の受付でお支払いください',
    },
  ];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />

      <div>
        <label className="label" htmlFor="reg-name">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input id="reg-name" name="name" required className="field" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="reg-email">
            メールアドレス <span className="text-red-500">*</span>
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
          参加人数
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
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer flex-col rounded-lg border p-3 transition ${
                paymentType === opt.value
                  ? 'border-brand bg-brand/5 ring-2 ring-brand/20'
                  : 'border-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment_type"
                  value={opt.value}
                  checked={paymentType === opt.value}
                  onChange={() => setPaymentType(opt.value)}
                />
                <span className="font-semibold text-slate-800">
                  {opt.label}
                </span>
                <span className="ml-auto font-bold text-brand">
                  {formatYen(opt.price)}
                </span>
              </span>
              <span className="mt-1 pl-6 text-xs text-slate-500">
                {opt.note}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="label" htmlFor="reg-note">
          備考・ご連絡事項
        </label>
        <textarea id="reg-note" name="note" rows={3} className="field" />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? '送信中...' : 'お申し込みを確定する'}
      </button>
    </form>
  );
}
