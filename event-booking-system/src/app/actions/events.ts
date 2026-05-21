'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import crypto from 'node:crypto';
import { isAdminAuthenticated } from '@/lib/auth';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  type EventInput,
} from '@/lib/events';

export type EventActionState = { error?: string };

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

async function saveUploadedImages(formData: FormData): Promise<string[]> {
  const files = formData
    .getAll('images')
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return [];

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const saved: string[] = [];
  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) continue;
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    saved.push(`/uploads/${filename}`);
  }
  return saved;
}

function parseFields(
  formData: FormData,
): { error?: string; input?: Omit<EventInput, 'images'> } {
  const title = String(formData.get('title') || '').trim();
  const event_date = String(formData.get('event_date') || '').trim();
  if (!title) return { error: 'イベント名を入力してください。' };
  if (!event_date) return { error: '開催日時を入力してください。' };

  const is_invite_only = formData.get('is_invite_only') === 'on';
  const invite_password = String(formData.get('invite_password') || '').trim();
  if (is_invite_only && !invite_password) {
    return { error: '完全招待制の場合は、参加用パスワードを設定してください。' };
  }

  const toInt = (key: string): number => {
    const n = Number(formData.get(key));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  };

  return {
    input: {
      title,
      description: String(formData.get('description') || '').trim(),
      venue: String(formData.get('venue') || '').trim(),
      event_date,
      capacity: toInt('capacity'),
      price_advance: toInt('price_advance'),
      price_door: toInt('price_door'),
      bank_info: String(formData.get('bank_info') || '').trim(),
      is_invite_only,
      invite_password,
      status: formData.get('status') === 'draft' ? 'draft' : 'published',
    },
  };
}

export async function createEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  if (!(await isAdminAuthenticated())) return { error: '認証が必要です。' };
  const parsed = parseFields(formData);
  if (parsed.error || !parsed.input) return { error: parsed.error };

  const images = await saveUploadedImages(formData);
  createEvent({ ...parsed.input, images });
  revalidatePath('/admin');
  revalidatePath('/');
  redirect('/admin');
}

export async function updateEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  if (!(await isAdminAuthenticated())) return { error: '認証が必要です。' };
  const id = Number(formData.get('eventId'));
  const existing = getEvent(id);
  if (!existing) return { error: 'イベントが見つかりません。' };

  const parsed = parseFields(formData);
  if (parsed.error || !parsed.input) return { error: parsed.error };

  const removed = new Set(
    formData.getAll('remove_image').map((v) => String(v)),
  );
  const kept = existing.images.filter((img) => !removed.has(img));
  const uploaded = await saveUploadedImages(formData);

  updateEvent(id, { ...parsed.input, images: [...kept, ...uploaded] });
  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath(`/admin/events/${id}`);
  revalidatePath(`/events/${id}`);
  redirect('/admin');
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  if (!(await isAdminAuthenticated())) throw new Error('認証が必要です。');
  const id = Number(formData.get('eventId'));
  if (Number.isFinite(id)) deleteEvent(id);
  revalidatePath('/admin');
  revalidatePath('/');
  redirect('/admin');
}
