import { Venue } from './common';

export type SeatState = 'available' | 'sold' | 'held' | 'unavailable';

export interface Seat {
  id: number;
  code: string;
  label: string;
  state: SeatState;
  aisleAfter: boolean;
  isMine: boolean;
}
export interface SeatRow {
  label: string;
  seats: Seat[];
}
export interface SeatSection {
  name: string;
  rows: SeatRow[];
}
export interface SeatMap {
  sessionId: number;
  hall: { id: number; name: string; venue: Venue };
  sections: SeatSection[];
}
export interface SeatMapResponse {
  data: SeatMap;
}

export interface TicketTypeRef {
  slug: string;
  name: string;
}

export interface HoldSeat {
  seatId: number;
  code: string;
  ticketType: TicketTypeRef;
  price: number;
}
export interface Hold {
  holdId: string;
  sessionId: number;
  expiresAt: string;
  secondsRemaining: number;
  isLive: boolean;
  subtotal: number;
  seats: HoldSeat[];
}
export interface HoldResponse {
  data: Hold;
}

export interface HoldRequestSeat {
  seatId: number;
  ticketType: string;
}

export interface OrderRequest {
  holdId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface Order {
  id: number;
  reference: string;
  totalPrice: number;
  contact: { fullName: string; email: string; mobileNumber: string };
  session: {
    date: string;
    time: string;
    hall: { name: string };
    venue: { name: string };
    movie: { title: string; posterUrl: string };
  };
  tickets: { id: number; seatCode: string; ticketType: TicketTypeRef; price: number }[];
}
export interface OrderResponse {
  data: Order;
}
