export type EventStatus = 'draft' | 'published';

export interface EventRecord {
  id: number;
  title: string;
  description: string;
  venue: string;
  event_date: string;
  capacity: number;
  price_advance: number;
  price_door: number;
  bank_info: string;
  is_invite_only: number;
  invite_password: string;
  images: string;
  status: EventStatus;
  created_at: string;
}

export interface EventWithImages extends Omit<EventRecord, 'images'> {
  images: string[];
}

export type PaymentType = 'advance' | 'door';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface ReservationRecord {
  id: number;
  event_id: number;
  name: string;
  email: string;
  phone: string;
  quantity: number;
  payment_type: PaymentType;
  payment_status: PaymentStatus;
  note: string;
  created_at: string;
}

export interface EventStats {
  reservedSeats: number;
  remainingSeats: number | null;
  expectedRevenue: number;
  confirmedRevenue: number;
  reservationCount: number;
}
