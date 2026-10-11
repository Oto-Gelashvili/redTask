import { inject, Injectable, signal } from '@angular/core';
import { NotificationService } from './notification.service';
import { RecentMovie } from '../../models/movie';

const KEY = 'recently-viewed';
const MAX = 5;

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private readonly _items = signal<RecentMovie[]>(this.read());
  private readonly noty = inject(NotificationService);
  readonly items = this._items.asReadonly();

  add(movie: RecentMovie) {
    const next = [movie, ...this._items().filter((m) => m.id !== movie.id)].slice(0, MAX);
    this._items.set(next);
    this.write(next);
  }

  private read(): RecentMovie[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      this.noty.showError('Coudnt get recent movies');
      return [];
    }
  }

  private write(items: RecentMovie[]) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      this.noty.showError('Coudnt store recent movies');
    }
  }
}
