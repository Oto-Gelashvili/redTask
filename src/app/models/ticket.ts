export type TicketFilter = 'upcoming' | 'past';

export interface Format {
  id: number;
  slug: string;
  name: string;
  priceUplift: number;
}

export interface AgeRating {
  code: string;
  minAge: number;
  description: string;
}

export interface Genre {
  id: number;
  slug: string;
  name: string;
}

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
  venue: {
    id: number;
    slug: string;
    name: string;
    city: string;
    formats: Format[];
  };
  format: Format;
  language: { id: number; slug: string; name: string; code: string };
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
