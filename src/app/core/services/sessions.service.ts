import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { SessionsQuery, SessionsResponse } from '../../models/session';

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private readonly api = inject(ApiService);

  getSessions(query: SessionsQuery = {}): Promise<SessionsResponse> {
    const params = new URLSearchParams();

    if (query.date) params.set('date', query.date);
    if (query.search) params.set('search', query.search);
    if (query.sort) params.set('sort', query.sort);
    if (query.page) params.set('page', String(query.page));

    for (const key of ['venues', 'formats', 'languages', 'bands'] as const) {
      query[key]?.forEach((value) => params.append(`${key}[]`, value));
    }

    const qs = params.toString();
    return this.api.request<SessionsResponse>(`/sessions${qs ? `?${qs}` : ''}`);
  }
}
