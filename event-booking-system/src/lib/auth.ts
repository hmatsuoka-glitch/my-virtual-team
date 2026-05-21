import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';
export const DEV_SECRET = 'dev-insecure-session-secret';

export function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || DEV_SECRET;
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || 'admin';
  return password.length > 0 && password === expected;
}

export async function createAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, sessionSecret(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === sessionSecret();
}
