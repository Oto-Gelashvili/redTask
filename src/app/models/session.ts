import { AgeRating, Format, Genre, Language, Venue } from './common';

export interface SessionMovie {
  id: number;
  slug: string;
  title: string;
  kind: string;
  runtimeMinutes: number;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  isComingSoon: boolean;
  isNotified: boolean;
  isFeatured: boolean;
  fromPrice: number;
  ageRating: AgeRating;
  genres: Genre[];
  formats: Format[];
}

export interface Session {
  id: number;
  startsAt: string;
  date: string;
  time: string;
  timeBand: 'morning' | 'afternoon' | 'evening';
  price: number;
  seatsLeft: number;
  isSoldOut: boolean;
  hall: { id: number; name: string; venue: Venue };
  venue: Venue;
  format: Format;
  language: Language;
}

export interface SessionGroup {
  movie: SessionMovie;
  sessions: Session[];
}

export interface SessionsMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  totalSessions: number;
  totalMovies: number;
  date: string;
}

export interface SessionsResponse {
  data: SessionGroup[];
  meta: SessionsMeta;
}

export interface SessionsQuery {
  date?: string;
  venues?: string[];
  formats?: string[];
  languages?: string[];
  bands?: string[];
  search?: string;
  sort?: string;
  page?: number;
}
export interface ActiveFilters {
  venues: string[];
  formats: string[];
  languages: string[];
  bands: string[];
  date: string;
}
export type ListFilterKey = 'venues' | 'formats' | 'languages' | 'bands';
