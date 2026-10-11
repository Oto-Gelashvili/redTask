import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { RecentMovie } from '../../models/movie';
const MAX = 8;
@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private readonly auth = inject(AuthService);

  private readonly key = computed(() => {
    const user = this.auth.user();
    if (user) return `recently-viewed:${user.id}`;
    return this.auth.isAuthenticated() ? null : 'recently-viewed:guest';
  });

  private readonly _items = signal<RecentMovie[]>([]);
  readonly items = this._items.asReadonly();

  constructor() {
    effect(() => {
      const key = this.key();
      this._items.set(key ? this.read(key) : []);
    });
  }

  add(movie: RecentMovie) {
    const key = this.key();
    if (!key) return;
    const next = [movie, ...this._items().filter((m) => m.id !== movie.id)].slice(0, MAX);
    this._items.set(next);
    this.write(key, next);
  }

  private read(key: string): RecentMovie[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private write(key: string, items: RecentMovie[]) {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {}
  }
}
