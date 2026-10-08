import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { SessionMovie } from '../../models/session';
import { SearchResponse } from '../../models/search';

// TODO: confirm the query param name in the API docs
const SEARCH_PARAM = 'q';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly api = inject(ApiService);

  async search(term: string, signal?: AbortSignal): Promise<SessionMovie[]> {
    const q = term.trim();
    if (!q) return [];

    const params = new URLSearchParams({ [SEARCH_PARAM]: q });
    const res = await this.api.request<SearchResponse>(`/search?${params}`, { signal });
    return res.data;
  }
}
