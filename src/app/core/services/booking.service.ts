import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import {
  HoldRequestSeat,
  HoldResponse,
  OrderRequest,
  OrderResponse,
  SeatMapResponse,
} from '../../models/booking';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly api = inject(ApiService);

  getSeats(sessionId: number) {
    return this.api.request<SeatMapResponse>(`/sessions/${sessionId}/seats`);
  }

  createHold(sessionId: number, seats: HoldRequestSeat[]) {
    return this.api.request<HoldResponse>(`/sessions/${sessionId}/holds`, {
      method: 'POST',
      body: JSON.stringify({ seats }),
    });
  }

  getHold(holdId: string) {
    return this.api.request<HoldResponse>(`/holds/${holdId}`);
  }

  releaseHold(holdId: string) {
    return this.api.request<unknown>(`/holds/${holdId}`, { method: 'DELETE' });
  }

  createOrder(body: OrderRequest) {
    return this.api.request<OrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}
