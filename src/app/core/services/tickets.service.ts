import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Order, TicketFilter } from '../../models/ticket';

@Injectable()
export class TicketsService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly _upcoming = signal<Order[]>([]);
  readonly upcoming = this._upcoming.asReadonly();
  readonly upcomingCount = computed(() => this._upcoming().length);

  constructor() {
    effect(() => {
      if (!this.auth.isAuthenticated()) this._upcoming.set([]);
    });
  }

  async getTickets(filter?: TicketFilter): Promise<Order[]> {
    const query = filter ? `?filter=${filter}` : '';
    const res = await this.api.request<{ data: Order[] }>(`/tickets${query}`);
    return res.data;
  }

  async loadUpcoming(): Promise<void> {
    try {
      this._upcoming.set(await this.getTickets('upcoming'));
    } catch {
      // 401 is already handled by ApiService
    }
  }
}
