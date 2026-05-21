import ConfirmButton from '@/app/admin/ConfirmButton';
import {
  setReservationStatusAction,
  deleteReservationAction,
} from '@/app/actions/reservations';
import {
  formatDateTime,
  formatYen,
  paymentStatusLabel,
  paymentTypeLabel,
} from '@/lib/format';
import type { EventWithImages, ReservationRecord } from '@/lib/types';

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-200 text-slate-500',
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
      <div className="card p-10 text-center text-sm text-slate-500">
        まだ予約はありません。
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
            <th className="px-4 py-3">申込者</th>
            <th className="px-4 py-3">支払方法</th>
            <th className="px-4 py-3 text-right">人数 / 金額</th>
            <th className="px-4 py-3">入金状況</th>
            <th className="px-4 py-3">申込日時</th>
            <th className="px-4 py-3">操作</th>
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
                className="border-b border-slate-100 align-top last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.email}</div>
                  {r.phone && (
                    <div className="text-xs text-slate-500">{r.phone}</div>
                  )}
                  {r.note && (
                    <div className="mt-1 text-xs text-slate-400">
                      備考：{r.note}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {paymentTypeLabel(r.payment_type)}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {r.quantity}名
                  <div className="font-semibold text-slate-900">
                    {formatYen(amount)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${STATUS_BADGE[r.payment_status] ?? ''}`}
                  >
                    {paymentStatusLabel(r.payment_status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatDateTime(r.created_at)}
                </td>
                <td className="px-4 py-3">
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
                          className="btn-primary btn-sm"
                        >
                          入金確認
                        </button>
                      )}
                      {r.payment_status !== 'pending' && (
                        <button
                          type="submit"
                          name="status"
                          value="pending"
                          className="btn-outline btn-sm"
                        >
                          未入金に戻す
                        </button>
                      )}
                      {r.payment_status !== 'cancelled' && (
                        <ConfirmButton
                          name="status"
                          value="cancelled"
                          className="btn-outline btn-sm"
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
