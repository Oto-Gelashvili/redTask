import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Filter } from './components/filter/filter';
import { List } from './components/list/list';
import { SessionsService } from '../../core/services/sessions.service';
import { ActiveFilters, SessionsResponse } from '../../models/session';
import { ApiError } from '../../models/api-error';
import { NotificationService } from '../../core/services/notification.service';
import { Skeleton } from './components/skeleton/skeleton';
import { ActivatedRoute, Router } from '@angular/router';
import { toLocalISODate } from '../../shared/utils';
const DEFAULT_SORT = 'time_asc';
const toArray = (v: string | string[] | undefined) =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

type Param = string | string[] | undefined;

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
  protected readonly errorContent = signal<string | undefined>(undefined);
  private readonly today = toLocalISODate(new Date());

  readonly sortParam = input<string | undefined>(undefined, { alias: 'sort' });
  readonly venuesParam = input<Param>(undefined, { alias: 'venues' });
  readonly formatsParam = input<Param>(undefined, { alias: 'formats' });
  readonly languagesParam = input<Param>(undefined, { alias: 'languages' });
  readonly bandsParam = input<Param>(undefined, { alias: 'bands' });
  readonly dateParam = input<string | undefined>(undefined, { alias: 'date' });
  readonly pageParam = input<string | undefined>(undefined, { alias: 'page' });
  protected readonly sortValue = computed(() => this.sortParam() || DEFAULT_SORT);
  protected readonly page = computed(() => {
    const n = Number(this.pageParam());
    return Number.isInteger(n) && n >= 1 ? n : 1;
  });
  protected readonly filters = computed<ActiveFilters>(
    () => ({
      venues: toArray(this.venuesParam()),
      formats: toArray(this.formatsParam()),
      languages: toArray(this.languagesParam()),
      bands: toArray(this.bandsParam()),
      date: /^\d{4}-\d{2}-\d{2}$/.test(this.dateParam() ?? '') ? this.dateParam()! : this.today,
    }),
    //for unrelated query params, we don't want to trigger a reload. So we compare the filters object by value, not by reference.
    // ai added this during refactor, not really sure if it's needed, but it seems a safety net
    { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
  );
  private requestId = 0;

  constructor() {
    effect(() => {
      this.page();
      this.sortValue();
      this.filters();
      untracked(() => this.load());
    });
  }

  protected async load() {
    const id = ++this.requestId;
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      const res = await this.sessionsService.getSessions({
        page: this.page(),
        sort: this.sortValue(),
        ...this.filters(),
      });
      if (id !== this.requestId) return;
      if (res.meta.lastPage >= 1 && this.page() > res.meta.lastPage) {
        this.updateQuery({ page: res.meta.lastPage }, true);
        return;
      }
      this.data.set(res);
    } catch (err) {
      if (id !== this.requestId) return;
      const apiError = err as ApiError;
      this.hasError.set(true);
      this.errorContent.set(
        apiError.status === 422 && apiError.message ? apiError.message : undefined,
      );
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
    this.updateQuery({ page: page === 1 ? null : page });
  }
  protected changeSort(id: string) {
    this.updateQuery({ sort: id === DEFAULT_SORT ? null : id, page: null });
  }
  protected changeFilters(patch: Partial<ActiveFilters>) {
    const query: Record<string, string | string[] | number | null> = { page: null };

    for (const key of ['venues', 'formats', 'languages', 'bands'] as const) {
      const value = patch[key];
      if (value) query[key] = value.length ? value : null;
    }
    if (patch.date) query['date'] = patch.date === this.today ? null : patch.date;

    this.updateQuery(query);
  }
  protected clearFilters() {
    this.updateQuery({ venues: null, formats: null, languages: null, bands: null, page: null });
  }
  private updateQuery(params: Record<string, string | number | string[] | null>, replace = false) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: replace,
    });
  }
}
