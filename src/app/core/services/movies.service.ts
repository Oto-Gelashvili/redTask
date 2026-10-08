import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { MovieResponse, MovieSessionsResponse } from '../../models/movie';

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
}
