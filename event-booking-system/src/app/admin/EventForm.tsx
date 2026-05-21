'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import type { MouseEvent } from 'react';
import type { EventWithImages } from '@/lib/types';
import type { EventActionState } from '@/app/actions/events';
import { toDateTimeLocalValue } from '@/lib/format';

type FormAction = (
  prev: EventActionState,
  formData: FormData,
) => Promise<EventActionState>;
type DeleteAction = (formData: FormData) => Promise<void>;

export default function EventForm({
  mode,
  action,
  event,
  deleteAction,
}: {
  mode: 'create' | 'edit';
  action: FormAction;
  event?: EventWithImages;
  deleteAction?: DeleteAction;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [inviteOnly, setInviteOnly] = useState(
    Boolean(event?.is_invite_only),
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="card space-y-6 p-7">
        {mode === 'edit' && event && (
          <input type="hidden" name="eventId" value={event.id} />
        )}

        <div>
          <label className="label" htmlFor="f-title">
            イベント名 <span className="text-gold">*</span>
          </label>
          <input
            id="f-title"
            name="title"
            required
            defaultValue={event?.title ?? ''}
            className="field"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="f-date">
              開催日時 <span className="text-gold">*</span>
            </label>
            <input
              id="f-date"
              name="event_date"
              type="datetime-local"
              required
              defaultValue={
                event ? toDateTimeLocalValue(event.event_date) : ''
              }
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor="f-venue">
              会場
            </label>
            <input
              id="f-venue"
              name="venue"
              defaultValue={event?.venue ?? ''}
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="f-description">
            イベント説明
          </label>
          <textarea
            id="f-description"
            name="description"
            rows={5}
            defaultValue={event?.description ?? ''}
            className="field"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="f-price-advance">
              事前振込 料金（円）
            </label>
            <input
              id="f-price-advance"
              name="price_advance"
              type="number"
              min={0}
              defaultValue={event?.price_advance ?? 0}
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor="f-price-door">
              当日払い 料金（円）
            </label>
            <input
              id="f-price-door"
              name="price_door"
              type="number"
              min={0}
              defaultValue={event?.price_door ?? 0}
              className="field"
            />
          </div>
          <div>
            <label className="label" htmlFor="f-capacity">
              定員（0で無制限）
            </label>
            <input
              id="f-capacity"
              name="capacity"
              type="number"
              min={0}
              defaultValue={event?.capacity ?? 0}
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="f-bank">
            お振込先情報（事前振込の方に表示されます）
          </label>
          <textarea
            id="f-bank"
            name="bank_info"
            rows={3}
            placeholder="例：〇〇銀行 △△支店 普通 1234567 カ）レット"
            defaultValue={event?.bank_info ?? ''}
            className="field"
          />
        </div>

        <div className="border border-line p-5">
          <label className="flex items-center gap-2.5 text-sm text-cream">
            <input
              type="checkbox"
              name="is_invite_only"
              checked={inviteOnly}
              onChange={(e) => setInviteOnly(e.target.checked)}
              className="accent-gold"
            />
            完全招待制にする（一覧には表示されますが、詳細・予約には招待コードが必要）
          </label>
          {inviteOnly && (
            <div className="mt-4">
              <label className="label" htmlFor="f-invite-password">
                招待コード <span className="text-gold">*</span>
              </label>
              <input
                id="f-invite-password"
                name="invite_password"
                defaultValue={event?.invite_password ?? ''}
                className="field max-w-xs"
              />
              <p className="mt-2 text-[11px] tracking-wide text-muted">
                このコードを招待者に共有してください。
              </p>
            </div>
          )}
        </div>

        {event && event.images.length > 0 && (
          <div>
            <span className="label">登録済みの写真</span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {event.images.map((img) => (
                <label
                  key={img}
                  className="block overflow-hidden border border-line"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                  <span className="flex items-center gap-1.5 bg-ink px-2 py-1.5 text-[11px] text-red-300">
                    <input
                      type="checkbox"
                      name="remove_image"
                      value={img}
                      className="accent-gold"
                    />
                    削除する
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="label" htmlFor="f-images">
            写真を追加（複数選択可・jpg / png / webp / gif）
          </label>
          <input
            id="f-images"
            name="images"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="field file:mr-3 file:cursor-pointer file:border file:border-line file:bg-surface2 file:px-3 file:py-1 file:text-xs file:text-cream"
          />
        </div>

        <div>
          <label className="label" htmlFor="f-status">
            公開状態
          </label>
          <select
            id="f-status"
            name="status"
            defaultValue={event?.status ?? 'published'}
            className="field max-w-xs"
          >
            <option value="published">公開する</option>
            <option value="draft">下書き（非公開）</option>
          </select>
        </div>

        {state.error && (
          <p className="border border-red-500/40 bg-red-500/10 p-3 text-xs tracking-wide text-red-300">
            {state.error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-gold" disabled={pending}>
            {pending
              ? '保存中...'
              : mode === 'create'
                ? 'イベントを作成'
                : '変更を保存'}
          </button>
          <Link href="/admin" className="btn-ghost">
            キャンセル
          </Link>
        </div>
      </form>

      {mode === 'edit' && event && deleteAction && (
        <form
          action={deleteAction}
          className="card border-red-500/30 p-7"
        >
          <input type="hidden" name="eventId" value={event.id} />
          <p className="text-sm tracking-wide text-muted">
            このイベントを削除すると、関連する予約データもすべて削除されます。
          </p>
          <button
            type="submit"
            className="btn-danger mt-4"
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              if (
                !window.confirm(
                  'このイベントと予約データをすべて削除します。よろしいですか？',
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            イベントを削除する
          </button>
        </form>
      )}
    </div>
  );
}
