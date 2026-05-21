export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

export function formatDateTime(iso: string): string {
  if (!iso) return '日時未定';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  }).format(d);
}

export function toDateTimeLocalValue(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const PAYMENT_TYPE_LABEL: Record<string, string> = {
  advance: '事前振込',
  door: '当日払い',
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: '未入金',
  paid: '入金確認済み',
  cancelled: 'キャンセル',
};

export function paymentTypeLabel(t: string): string {
  return PAYMENT_TYPE_LABEL[t] ?? t;
}

export function paymentStatusLabel(s: string): string {
  return PAYMENT_STATUS_LABEL[s] ?? s;
}
