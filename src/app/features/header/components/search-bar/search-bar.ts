import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SearchService } from '../../../../core/services/search.service';
import { SessionMovie } from '../../../../models/session';
import { Loader } from '../../../../shared/components/loader/loader';
const DEBOUNCE_MS = 300;

type Status = 'idle' | 'loading' | 'done' | 'error';
type Part = { text: string; match: boolean };

function splitMatch(title: string, term: string): Part[] {
  const i = term ? title.toLowerCase().indexOf(term.toLowerCase()) : -1;
  if (i < 0) return [{ text: title, match: false }];
  const end = i + term.length;
  return [
    { text: title.slice(0, i), match: false },
    { text: title.slice(i, end), match: true },
    { text: title.slice(end), match: false },
  ].filter((p) => p.text);
}

@Component({
  imports: [RouterLink, Loader],
  selector: 'app-search-bar',
  styleUrl: './search-bar.css',
  templateUrl: './search-bar.html',
})
export class SearchBar {
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly query = signal('');
  protected readonly focused = signal(false);
  protected readonly status = signal<Status>('idle');
  protected readonly activeIndex = signal(-1);

  private readonly results = signal<SessionMovie[]>([]);
  protected readonly searchedTerm = signal('');

  protected readonly items = computed(() =>
    this.results().map((movie) => ({
      movie,
      parts: splitMatch(movie.title, this.searchedTerm()),
    })),
  );

  protected readonly panel = computed<'closed' | 'prompt' | 'results' | 'empty' | 'error'>(() => {
    if (!this.focused()) return 'closed';
    if (!this.query().trim()) return 'prompt';
    if (this.items().length) return 'results';
    if (this.status() === 'error') return 'error';
    if (this.status() === 'done') return 'empty';
    return 'closed';
  });

  private debounceId: ReturnType<typeof setTimeout> | undefined;
  private controller: AbortController | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.debounceId);
      this.controller?.abort();
    });
  }

  protected onInput(value: string) {
    this.query.set(value);
    this.activeIndex.set(-1);

    clearTimeout(this.debounceId);
    this.controller?.abort();

    const term = value.trim();
    if (!term) {
      this.results.set([]);
      this.searchedTerm.set('');
      this.status.set('idle');
      return;
    }

    this.status.set('loading');
    this.debounceId = setTimeout(() => this.runSearch(term), DEBOUNCE_MS);
  }

  private async runSearch(term: string) {
    const controller = new AbortController();
    this.controller = controller;

    try {
      const data = await this.searchService.search(term, controller.signal);
      this.results.set(data);
      this.searchedTerm.set(term);
      this.status.set('done');
    } catch {
      if (controller.signal.aborted) return;
      this.results.set([]);
      this.searchedTerm.set(term);
      this.status.set('error');
    }
  }

  protected clear() {
    this.onInput('');
    this.input().nativeElement.focus();
  }

  protected close() {
    this.input().nativeElement.blur();
  }

  protected movieLink(movie: SessionMovie) {
    return ['/movies', movie.slug];
  }

  protected onKeydown(event: KeyboardEvent) {
    const count = this.items().length;

    switch (event.key) {
      case 'ArrowDown':
        if (!count) return;
        event.preventDefault();
        this.activeIndex.update((i) => (i + 1) % count);
        break;
      case 'ArrowUp':
        if (!count) return;
        event.preventDefault();
        this.activeIndex.update((i) => (i <= 0 ? count - 1 : i - 1));
        break;
      case 'Enter': {
        const active = this.items()[this.activeIndex()];
        if (!active) return;
        event.preventDefault();
        this.router.navigate(this.movieLink(active.movie));
        this.close();
        break;
      }
      case 'Escape':
        this.close();
        break;
    }
  }
}
