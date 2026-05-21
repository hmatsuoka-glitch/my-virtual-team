'use server';

import { redirect } from 'next/navigation';
import { getEvent } from '@/lib/events';
import { grantInviteAccess } from '@/lib/invite';

export type InviteState = { error?: string };

export async function unlockEventAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const eventId = Number(formData.get('eventId'));
  const password = String(formData.get('password') || '').trim();
  const event = getEvent(eventId);

  if (!event || !event.is_invite_only) {
    return { error: 'イベントが見つかりません。' };
  }
  if (!password || password !== event.invite_password) {
    return { error: '招待パスワードが正しくありません。' };
  }

  await grantInviteAccess(eventId, password);
  redirect(`/events/${eventId}`);
}
