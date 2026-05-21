import ConfirmButton from '@/app/admin/ConfirmButton';
import {
  setReservationStatusAction,
  deleteReservationAction,
} from '@/app/actions/reservations';
import {
  formatDateShort,
  formatYen,
  paymentStatusLabel,
  paymentTypeLabel,
} from '@/lib/format';
import type { EventWithImages, ReservationRecord } from '@/lib/types';

const STATUS_BADGE: Record<string, string> = {
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  paid: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  cancelled: 'border-line bg-white/5 text-muted',
};

export default function ReservationTable({
  event,
  reservations,
}: {
  event: EventWithImages;
  reservations: ReservationRecord[];
}) {
  if (reservations.length === 0) {
    return (
      <div className="card p-12 text-center text-sm tracking-wide text-muted">
        まだ予約はありません。
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[10px] uppercase tracking-widest text-muted">
            <th className="px-5 py-4 font-medium">申込者</th>
            <th className="px-5 py-4 font-medium">支払方法</th>
            <th className="px-5 py-4 text-right font-medium">人数 / 金額</th>
            <th className="px-5 py-4 font-medium">入金状況</th>
            <th className="px-5 py-4 font-medium">申込日時</th>
            <th className="px-5 py-4 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => {
            const unit =
              r.payment_type === 'advance'
                ? event.price_advance
                : event.price_door;
            const amount = unit * r.quantity;
            return (
              <tr
                key={r.id}
                className="border-b border-line align-top last:border-0"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-cream">{r.name}</div>
                  <div className="text-xs text-muted">{r.email}</div>
                  {r.phone && (
                    <div className="text-xs text-muted">{r.phone}</div>
                  )}
                  {r.note && (
                    <div className="mt-1 text-xs text-muted/70">
                      備考：{r.note}
                    </div>
                  )}
                </td>
                <td className="px-5 py-4 text-muted">
                  {paymentTypeLabel(r.payment_type)}
                </td>
                <td className="px-5 py-4 text-right text-muted">
                  {r.quantity}名
                  <div className="font-display text-base text-cream">
                    {formatYen(amount)}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`badge ${STATUS_BADGE[r.payment_status] ?? ''}`}
                  >
                    {paymentStatusLabel(r.payment_status)}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs uppercase tracking-wide text-muted">
                  {formatDateShort(r.created_at)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    <form action={setReservationStatusAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input
                        type="hidden"
                        name="eventId"
                        value={event.id}
                      />
                      {r.payment_status !== 'paid' && (
                        <button
                          type="submit"
                          name="status"
                          value="paid"
                          className="btn-gold btn-sm"
                        >
                          入金確認
                        </button>
                      )}
                      {r.payment_status !== 'pending' && (
                        <button
                          type="submit"
                          name="status"
                          value="pending"
                          className="btn-ghost btn-sm"
                        >
                          未入金に戻す
                        </button>
                      )}
                      {r.payment_status !== 'cancelled' && (
                        <ConfirmButton
                          name="status"
                          value="cancelled"
                          className="btn-ghost btn-sm"
                          confirmMessage="この予約をキャンセル扱いにします。よろしいですか？"
                        >
                          キャンセル
                        </ConfirmButton>
                      )}
                    </form>
                    <form action={deleteReservationAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input
                        type="hidden"
                        name="eventId"
                        value={event.id}
                      />
                      <ConfirmButton
                        className="btn-danger btn-sm"
                        confirmMessage="この予約データを完全に削除します。よろしいですか？"
                      >
                        削除
                      </ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
