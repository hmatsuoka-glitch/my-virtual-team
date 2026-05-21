'use server';

import { redirect } from 'next/navigation';
import {
  verifyAdminPassword,
  createAdminSession,
  destroyAdminSession,
} from '@/lib/auth';

export type AuthState = { error?: string };

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get('password') || '');
  if (!verifyAdminPassword(password)) {
    return { error: 'パスワードが正しくありません。' };
  }
  await createAdminSession();
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect('/admin/login');
}
