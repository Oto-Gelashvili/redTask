import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { FilterOptions } from '../../models/filter-options';

@Injectable({ providedIn: 'root' })
export class FilterOptionsService {
  private readonly api = inject(ApiService);

  private readonly _options = signal<FilterOptions | null>(null);
  readonly options = this._options.asReadonly();
  readonly loaded = computed(() => this._options() !== null);

  readonly venues = computed(() => this._options()?.venues ?? []);
  readonly formats = computed(() => this._options()?.formats ?? []);
  readonly languages = computed(() => this._options()?.languages ?? []);
  readonly timeBands = computed(() => this._options()?.timeBands ?? []);
  readonly sorts = computed(() => this._options()?.sorts ?? []);
  readonly ticketTypes = computed(() => this._options()?.ticketTypes ?? []);
  readonly maxSeatsPerOrder = computed(() => this._options()?.maxSeatsPerOrder ?? null);
  readonly holdMinutes = computed(() => this._options()?.holdMinutes ?? null);

  private loading: Promise<void> | null = null;

  /** Fetches once. Later callers get the same promise. A failure allows a retry. */
  load(): Promise<void> {
    this.loading ??= this.api
      .request<{ data: FilterOptions }>('/filter-options')
      .then((res) => this._options.set(res.data))
      .catch(() => {
        this.loading = null;
      });
    return this.loading;
  }
}
