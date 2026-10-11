import { Venue } from './common';
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
