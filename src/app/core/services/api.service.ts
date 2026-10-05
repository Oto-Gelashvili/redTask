import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';
import { ApiError } from '../../models/api-error';
import { BASE_URL } from '../config';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);
  private readonly notyService = inject(NotificationService);

  private pendingLogin: Promise<boolean> | null = null;

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.execute<T>(path, options, false);
  }

  private async execute<T>(path: string, options: RequestInit, isRetry: boolean): Promise<T> {
    const token = this.auth.token();
    const isFormData = options.body instanceof FormData;

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const json = await res.json().catch(() => ({}));

    if (res.status === 401 && token && !isRetry) {
      const loggedIn = await this.requestLogin(token);
      if (loggedIn) return this.execute<T>(path, options, true);
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

  private requestLogin(staleToken: string): Promise<boolean> {
    // a newer login already happened while this request was in flight
    const current = this.auth.token();
    if (current && current !== staleToken) return Promise.resolve(true);

    if (!this.pendingLogin) {
      this.auth.clearSession();
      this.modal.openLogIn();
      this.notyService.showError(
        'Your session has expired. Requset will be retried after logging in.',
      );
      this.pendingLogin = this.auth.waitForLogin().finally(() => (this.pendingLogin = null));
    }
    return this.pendingLogin;
  }
}
