import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';
import { ApiError } from '../../models/api-error';
import { BASE_URL } from '../config';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.auth.token();

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const json = await res.json().catch(() => ({}));

    if (res.status === 401) {
      this.handleSessionExpired();
    }

    if (!res.ok) {
      const error: ApiError = {
        status: res.status,
        message: json.message ?? 'Something went wrong.',
        errors: json.errors,
      };
      throw error;
    }

    return json;
  }

  private handleSessionExpired() {
    if (!this.auth.isAuthenticated()) return;

    this.auth.clearSession();
    this.modal.openLogIn();
    //here also to be added noty service to notify user about session expiration, will be implemented in the next sprint
  }
}
