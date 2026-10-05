import { AgeRating, Format, Genre, Language } from './common';
import { VenueWithFormats } from './filter-options';

export type TicketFilter = 'upcoming' | 'past';

export interface TicketMovie {
  id: number;
  slug: string;
  title: string;
  kind: string;
  runtimeMinutes: number;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  isComingSoon: boolean;
  isFeatured: boolean;
  fromPrice: number;
  ageRating: AgeRating;
  genres: Genre[];
  formats: Format[];
}

export interface TicketSession {
  id: number;
  startsAt: string;
  date: string;
  time: string;
  timeBand: string;
  price: number;
  seatsLeft: number;
  isSoldOut: boolean;
  hall: { id: number; name: string };
  venue: VenueWithFormats;
  format: Format;
  language: Language;
  movie: TicketMovie;
}

export interface Ticket {
  id: number;
  seatCode: string;
  ticketType: { slug: string; name: string };
  price: number;
}

export interface Order {
  id: number;
  reference: string;
  status: 'paid' | 'refunded' | string;
  totalPrice: number;
  paidAt: string;
  refundedAt: string | null;
  isUpcoming: boolean;
  isRefundable: boolean;
  cardLastFour: string;
  contact: { fullName: string; email: string; mobileNumber: string };
  session: TicketSession;
  tickets: Ticket[];
}
