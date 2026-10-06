import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Filter } from './components/filter/filter';
import { List } from './components/list/list';
import { SessionsService } from '../../core/services/sessions.service';
import { SessionsResponse } from '../../models/session';
import { ApiError } from '../../models/api-error';
import { NotificationService } from '../../core/services/notification.service';
import { Skeleton } from './components/skeleton/skeleton';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  imports: [Filter, List, Skeleton],
  selector: 'app-sessions',
  styleUrl: './sessions.css',
  templateUrl: './sessions.html',
})
export class Sessions {
  private readonly sessionsService = inject(SessionsService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly data = signal<SessionsResponse | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);

  readonly pageParam = input<string | undefined>(undefined, { alias: 'page' });
  protected readonly page = computed(() => {
    const n = Number(this.pageParam());
    return Number.isInteger(n) && n >= 1 ? n : 1; // junk or missing becomes 1
  });

  private requestId = 0;

  constructor() {
    effect(() => {
      this.page();
      untracked(() => this.load());
    });
  }

  protected async load() {
    const id = ++this.requestId;
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      const res = await this.sessionsService.getSessions({ page: this.page() });
      if (id !== this.requestId) return;
      if (res.meta.lastPage >= 1 && this.page() > res.meta.lastPage) {
        this.setPage(res.meta.lastPage, true);
        return;
      }
      this.data.set(res);
    } catch (err) {
      if (id !== this.requestId) return;
      const apiError = err as ApiError;
      this.hasError.set(true);
      this.notificationService.showError(
        apiError.status === 422 && apiError.message
          ? apiError.message
          : 'Could not load sessions. Please try again.',
      );
    } finally {
      if (id === this.requestId) this.isLoading.set(false);
    }
  }
  protected goToPage(page: number) {
    this.setPage(page);
  }

  private setPage(page: number, replace = false) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
      replaceUrl: replace,
    });
  }
}
