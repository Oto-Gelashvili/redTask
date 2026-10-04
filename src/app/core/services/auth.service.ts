import { Injectable, signal, computed } from '@angular/core';
import { User } from '../../models/user';
import { BASE_URL } from '../config';
import { ApiError } from '../../models/api-error';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);

  user = this._user.asReadonly();
  token = this._token.asReadonly();

  isAuthenticated = computed(() => !!this._token());
  private loginWaiters: ((success: boolean) => void)[] = [];
  private settleLoginWaiters(success: boolean) {
    this.loginWaiters.forEach((resolve) => resolve(success));
    this.loginWaiters = [];
  }
  constructor() {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      this._token.set(savedToken);
      this.fetchMe();
    }
  }

  async fetchMe() {
    try {
      const res = await fetch(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${this._token()}` },
      });

      if (res.status === 401) {
        this.clearSession(); //here user should be notified about the session expiration and redirected to the login page, i will implement this in the next sprint, for now i will just return from here
        return;
      }

      const json = await res.json();
      this._user.set(json.data);
    } catch {
      // network error on app start — keep existing session state
    }
  }
  setSession(user: User, token: string) {
    this._user.set(user);
    this._token.set(token);
    localStorage.setItem('token', token);
    this.settleLoginWaiters(true);
  }
  clearSession() {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem('token');
  }
  updateUser(user: User) {
    this._user.set(user);
  }

  async logIn(credentials: { email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const json = await res.json();
    if (!res.ok) {
      const error: ApiError = {
        status: res.status,
        message: json.message ?? 'Something went wrong.',
        errors: json.errors,
      };
      throw error;
    }
    this.setSession(json.data.user, json.data.token);

    return json.data;
  }
  waitForLogin(): Promise<boolean> {
    return new Promise((resolve) => this.loginWaiters.push(resolve));
  }

  cancelLoginWait() {
    this.settleLoginWaiters(false);
  }
}
