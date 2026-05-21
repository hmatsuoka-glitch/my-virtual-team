import db from './db';
import type {
  EventWithImages,
  EventStats,
  PaymentStatus,
  PaymentType,
  ReservationRecord,
} from './types';

export interface ReservationInput {
  event_id: number;
  name: string;
  email: string;
  phone: string;
  quantity: number;
  payment_type: PaymentType;
  note: string;
}

export function listByEvent(eventId: number): ReservationRecord[] {
  return db
    .prepare(
      `SELECT * FROM reservations WHERE event_id = ? ORDER BY created_at DESC`,
    )
    .all(eventId) as ReservationRecord[];
}

export function getReservation(id: number): ReservationRecord | null {
  const row = db.prepare(`SELECT * FROM reservations WHERE id = ?`).get(id) as
    | ReservationRecord
    | undefined;
  return row ?? null;
}

export function reservedSeats(eventId: number): number {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(quantity), 0) AS seats
       FROM reservations
       WHERE event_id = ? AND payment_status != 'cancelled'`,
    )
    .get(eventId) as { seats: number };
  return row.seats;
}

export function createReservation(input: ReservationInput): number {
  const result = db
    .prepare(
      `INSERT INTO reservations
        (event_id, name, email, phone, quantity, payment_type, note)
       VALUES
        (@event_id, @name, @email, @phone, @quantity, @payment_type, @note)`,
    )
    .run(input);
  return Number(result.lastInsertRowid);
}

export function updateReservationStatus(
  id: number,
  status: PaymentStatus,
): void {
  db.prepare(`UPDATE reservations SET payment_status = ? WHERE id = ?`).run(
    status,
    id,
  );
}

export function deleteReservation(id: number): void {
  db.prepare(`DELETE FROM reservations WHERE id = ?`).run(id);
}

export function getEventStats(event: EventWithImages): EventStats {
  const rows = listByEvent(event.id);
  let reserved = 0;
  let expected = 0;
  let confirmed = 0;
  let count = 0;

  for (const r of rows) {
    if (r.payment_status === 'cancelled') continue;
    count += 1;
    reserved += r.quantity;
    const unit =
      r.payment_type === 'advance' ? event.price_advance : event.price_door;
    const amount = unit * r.quantity;
    expected += amount;
    if (r.payment_status === 'paid') confirmed += amount;
  }

  return {
    reservedSeats: reserved,
    remainingSeats: event.capacity > 0 ? event.capacity - reserved : null,
    expectedRevenue: expected,
    confirmedRevenue: confirmed,
    reservationCount: count,
  };
}
