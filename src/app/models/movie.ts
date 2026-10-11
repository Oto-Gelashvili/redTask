import { AgeRating, Genre, Venue } from './common';
import { Session, SessionMovie } from './session';

export interface MovieDetail extends SessionMovie {
  synopsis: string;
  director: string;
  cast: string;
  availableDates: string[];
}

export interface MovieResponse {
  data: MovieDetail;
}

export interface VenueSessions {
  venue: Venue;
  sessions: Session[];
}

export interface MovieSessionsResponse {
  data: VenueSessions[];
}
export interface FeaturedMovie extends SessionMovie {
  synopsis: string;
}
export interface RecentMovie {
  id: number | string;
  slug: string;
  title: string;
  posterUrl: string;
  genre: string;
  runtimeMinutes: number;
  ageRating: string;
}
export interface NowPlayingMovie {
  id: number;
  slug: string;
  title: string;
  runtimeMinutes: number;
  posterUrl: string;
  fromPrice: number;
  ageRating: AgeRating;
  genres: Genre[];
  synopsis: string;
}
