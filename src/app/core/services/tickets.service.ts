import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Order } from '../../models/ticket';

@Injectable()
export class TicketsService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly _orders = signal<Order[]>([]);
  private readonly _loaded = signal(false);
  private readonly _error = signal(false);

  readonly loaded = this._loaded.asReadonly();
  readonly error = this._error.asReadonly();

  readonly upcoming = computed(() =>
    this._orders()
      .filter((o) => o.isUpcoming)
      .sort((a, b) => Date.parse(a.session.startsAt) - Date.parse(b.session.startsAt)),
  );
  readonly past = computed(() => this._orders().filter((o) => !o.isUpcoming));

  readonly upcomingCount = computed(() => this.upcoming().length);
  readonly pastCount = computed(() => this.past().length);

  constructor() {
    effect(() => {
      if (!this.auth.isAuthenticated()) {
        this._orders.set([]);
        this._loaded.set(false);
      }
    });
  }

  async load(): Promise<void> {
    this._error.set(false);
    try {
      const res = await this.api.request<{ data: Order[] }>('/tickets');
      this._orders.set(res.data);
      this._loaded.set(true);
    } catch {
      if (!this._loaded()) this._error.set(true);
    }
  }

  async refund(order: Order): Promise<Order> {
    const res = await this.api.request<{ data: Order }>(
      `/orders/${encodeURIComponent(order.reference)}/refund`,
      { method: 'POST' },
    );
    this._orders.update((list) => list.map((o) => (o.id === order.id ? res.data : o)));
    return res.data;
  }
}
