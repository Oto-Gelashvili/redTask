import { Component, computed, inject, input, output } from '@angular/core';
import { FilterOptionsService } from '../../../../core/services/filter-options.service';
import { ActiveFilters, ListFilterKey } from '../../../../models/session';
import { toLocalISODate } from '../../../../shared/utils';
import { DragScroll } from '../../../../shared/directives/drag-scroll';

@Component({
  imports: [DragScroll],
  selector: 'app-filter',
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class Filter {
  protected readonly options = inject(FilterOptionsService);

  readonly filters = input.required<ActiveFilters>();
  readonly filtersChange = output<Partial<ActiveFilters>>();
  readonly cleared = output<void>();

  protected readonly days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: toLocalISODate(d),
      weekday: d.toLocaleDateString('en', { weekday: 'short' }),
      day: d.getDate(),
    };
  });

  protected readonly availableFormats = computed(() => {
    const selected = this.filters().venues;
    if (!selected.length) return this.options.formats();

    const allowed = new Set(
      this.options
        .venues()
        .filter((v) => selected.includes(v.slug))
        .flatMap((v) => v.formats.map((f) => f.slug)),
    );
    return this.options.formats().filter((f) => allowed.has(f.slug));
  });

  protected readonly activeCount = computed(() => {
    const f = this.filters();
    return f.venues.length + f.formats.length + f.languages.length + f.bands.length;
  });

  protected isSelected(key: ListFilterKey, slug: string) {
    return this.filters()[key].includes(slug);
  }

  protected toggle(key: ListFilterKey, slug: string) {
    const current = this.filters()[key];
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];

    if (key !== 'venues') {
      this.filtersChange.emit({ [key]: next });
      return;
    }

    // venues changed: drop selected formats the remaining venues don't offer.
    // Computed from `next`, because availableFormats still reflects the old selection
    const allowed = new Set(
      next.length
        ? this.options
            .venues()
            .filter((v) => next.includes(v.slug))
            .flatMap((v) => v.formats.map((f) => f.slug))
        : this.options.formats().map((f) => f.slug),
    );
    this.filtersChange.emit({
      venues: next,
      formats: this.filters().formats.filter((s) => allowed.has(s)),
    });
  }

  protected selectDate(date: string) {
    if (date !== this.filters().date) this.filtersChange.emit({ date });
  }
}
