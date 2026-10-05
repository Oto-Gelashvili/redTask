import { AgeRating, Format, Language, Venue } from './common';

export interface VenueWithFormats extends Venue {
  formats: Format[];
}

export interface TimeBandOption {
  id: 'morning' | 'afternoon' | 'evening';
  label: string;
}

export interface SortOption {
  id: string;
  label: string;
}

export interface TicketTypeOption {
  id: number;
  slug: string;
  name: string;
  priceRatio: number;
  note: string | null;
  blockedFromRatingAge: number | null;
}

export interface FilterOptions {
  venues: VenueWithFormats[];
  formats: Format[];
  languages: Language[];
  timeBands: TimeBandOption[];
  sorts: SortOption[];
  ticketTypes: TicketTypeOption[];
  ageRatings: AgeRating[];
  maxSeatsPerOrder: number;
  holdMinutes: number;
}
