import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import {
  ComingSoonMovie,
  FeaturedMovie,
  MovieResponse,
  MovieSessionsResponse,
  NowPlayingMovie,
} from '../../models/movie';

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private readonly api = inject(ApiService);

  getMovie(slug: string): Promise<MovieResponse> {
    return this.api.request<MovieResponse>(`/movies/${encodeURIComponent(slug)}`);
  }

  getSessions(slug: string, date: string): Promise<MovieSessionsResponse> {
    const params = new URLSearchParams({ date });
    return this.api.request<MovieSessionsResponse>(
      `/movies/${encodeURIComponent(slug)}/sessions?${params}`,
    );
  }
  getFeatured() {
    return this.api.request<{ data: FeaturedMovie[] }>('/movies/featured');
  }
  getNowPlaying(limit?: number) {
    const query = limit ? `?${new URLSearchParams({ limit: String(limit) })}` : '';
    return this.api.request<{ data: NowPlayingMovie[] }>(`/movies/now-playing${query}`);
  }
  getComingSoon(limit?: number) {
    const query = limit ? `?${new URLSearchParams({ limit: String(limit) })}` : '';
    return this.api.request<{ data: ComingSoonMovie[] }>(`/movies/coming-soon${query}`);
  }

  notify(slug: string) {
    return this.api.request<{ data: { movieId: number; subscribed: boolean } }>(
      `/movies/${encodeURIComponent(slug)}/notify`,
      { method: 'POST' },
    );
  }
}
