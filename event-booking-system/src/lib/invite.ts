import { cookies } from 'next/headers';

function cookieName(eventId: number): string {
  return `event_access_${eventId}`;
}

export async function grantInviteAccess(
  eventId: number,
  password: string,
): Promise<void> {
  const store = await cookies();
  store.set(cookieName(eventId), password, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function hasInviteAccess(
  eventId: number,
  invitePassword: string,
): Promise<boolean> {
  if (!invitePassword) return false;
  const store = await cookies();
  return store.get(cookieName(eventId))?.value === invitePassword;
}
