import db from './db';
import type { EventRecord, EventWithImages, EventStatus } from './types';

function mapEvent(row: EventRecord): EventWithImages {
  let images: string[] = [];
  try {
    const parsed = JSON.parse(row.images);
    if (Array.isArray(parsed)) images = parsed.filter((x) => typeof x === 'string');
  } catch {
    images = [];
  }
  return { ...row, images };
}

export interface EventInput {
  title: string;
  description: string;
  venue: string;
  event_date: string;
  capacity: number;
  price_advance: number;
  price_door: number;
  bank_info: string;
  is_invite_only: boolean;
  invite_password: string;
  images: string[];
  status: EventStatus;
}

export function listPublicEvents(): EventWithImages[] {
  const rows = db
    .prepare(
      `SELECT * FROM events
       WHERE status = 'published' AND is_invite_only = 0
       ORDER BY event_date ASC`,
    )
    .all() as EventRecord[];
  return rows.map(mapEvent);
}

export function listAllEvents(): EventWithImages[] {
  const rows = db
    .prepare(`SELECT * FROM events ORDER BY event_date ASC`)
    .all() as EventRecord[];
  return rows.map(mapEvent);
}

export function getEvent(id: number): EventWithImages | null {
  const row = db.prepare(`SELECT * FROM events WHERE id = ?`).get(id) as
    | EventRecord
    | undefined;
  return row ? mapEvent(row) : null;
}

export function createEvent(input: EventInput): number {
  const result = db
    .prepare(
      `INSERT INTO events
        (title, description, venue, event_date, capacity,
         price_advance, price_door, bank_info, is_invite_only,
         invite_password, images, status)
       VALUES
        (@title, @description, @venue, @event_date, @capacity,
         @price_advance, @price_door, @bank_info, @is_invite_only,
         @invite_password, @images, @status)`,
    )
    .run({
      title: input.title,
      description: input.description,
      venue: input.venue,
      event_date: input.event_date,
      capacity: input.capacity,
      price_advance: input.price_advance,
      price_door: input.price_door,
      bank_info: input.bank_info,
      is_invite_only: input.is_invite_only ? 1 : 0,
      invite_password: input.invite_password,
      images: JSON.stringify(input.images),
      status: input.status,
    });
  return Number(result.lastInsertRowid);
}

export function updateEvent(id: number, input: EventInput): void {
  db.prepare(
    `UPDATE events SET
       title = @title,
       description = @description,
       venue = @venue,
       event_date = @event_date,
       capacity = @capacity,
       price_advance = @price_advance,
       price_door = @price_door,
       bank_info = @bank_info,
       is_invite_only = @is_invite_only,
       invite_password = @invite_password,
       images = @images,
       status = @status
     WHERE id = @id`,
  ).run({
    id,
    title: input.title,
    description: input.description,
    venue: input.venue,
    event_date: input.event_date,
    capacity: input.capacity,
    price_advance: input.price_advance,
    price_door: input.price_door,
    bank_info: input.bank_info,
    is_invite_only: input.is_invite_only ? 1 : 0,
    invite_password: input.invite_password,
    images: JSON.stringify(input.images),
    status: input.status,
  });
}

export function deleteEvent(id: number): void {
  db.prepare(`DELETE FROM events WHERE id = ?`).run(id);
}
