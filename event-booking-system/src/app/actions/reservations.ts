'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getEvent } from '@/lib/events';
import {
  createReservation,
  reservedSeats,
  updateReservationStatus,
  deleteReservation,
} from '@/lib/reservations';
import { isAdminAuthenticated } from '@/lib/auth';
import type { PaymentStatus } from '@/lib/types';

export type ReservationState = { error?: string };

export async function createReservationAction(
  _prev: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const eventId = Number(formData.get('eventId'));
  const event = getEvent(eventId);
  if (!event || event.status !== 'published') {
    return { error: '現在お申し込みを受け付けていないイベントです。' };
  }

  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const note = String(formData.get('note') || '').trim();
  const quantity = Math.max(
    1,
    Math.floor(Number(formData.get('quantity')) || 1),
  );
  const payment_type =
    formData.get('payment_type') === 'door' ? 'door' : 'advance';

  if (!name) return { error: 'お名前を入力してください。' };
  if (!email || !email.includes('@')) {
    return { error: '正しいメールアドレスを入力してください。' };
  }

  if (event.capacity > 0) {
    const remaining = event.capacity - reservedSeats(eventId);
    if (remaining <= 0) return { error: '満席のため受付を終了しました。' };
    if (quantity > remaining) {
      return {
        error: `残り ${remaining} 名のみ受付可能です。人数をご調整ください。`,
      };
    }
  }

  const id = createReservation({
    event_id: eventId,
    name,
    email,
    phone,
    quantity,
    payment_type,
    note,
  });
  revalidatePath('/admin');
  revalidatePath(`/admin/events/${eventId}`);
  redirect(`/events/${eventId}/complete?rid=${id}`);
}

export async function setReservationStatusAction(
  formData: FormData,
): Promise<void> {
  if (!(await isAdminAuthenticated())) throw new Error('認証が必要です。');
  const id = Number(formData.get('id'));
  const eventId = Number(formData.get('eventId'));
  const raw = String(formData.get('status') || '');
  const status: PaymentStatus =
    raw === 'paid' ? 'paid' : raw === 'cancelled' ? 'cancelled' : 'pending';
  if (Number.isFinite(id)) updateReservationStatus(id, status);
  revalidatePath('/admin');
  revalidatePath(`/admin/events/${eventId}`);
}

export async function deleteReservationAction(
  formData: FormData,
): Promise<void> {
  if (!(await isAdminAuthenticated())) throw new Error('認証が必要です。');
  const id = Number(formData.get('id'));
  const eventId = Number(formData.get('eventId'));
  if (Number.isFinite(id)) deleteReservation(id);
  revalidatePath('/admin');
  revalidatePath(`/admin/events/${eventId}`);
}
