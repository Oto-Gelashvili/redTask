import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoviesService } from '../../../core/services/movies.service';
import { FeaturedMovie } from '../../../models/movie';
type State = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-hero',
  styleUrl: './hero.css',
  templateUrl: './hero.html',
  host: { '(document:keydown)': 'onKey($event)' },
})
export class Hero {
  private readonly moviesService = inject(MoviesService);

  protected readonly movies = signal<FeaturedMovie[]>([]);
  protected readonly state = signal<State>('loading');
  protected readonly index = signal(0);
  protected readonly canSlide = computed(() => this.movies().length > 1);

  constructor() {
    void this.load();
  }

  protected async load() {
    this.state.set('loading');
    try {
      const res = await this.moviesService.getFeatured();
      this.movies.set(res.data.slice(0, 4));
      this.index.set(0);
      this.state.set(res.data.length ? 'ready' : 'empty');
    } catch {
      this.state.set('error');
    }
  }

  protected go(i: number) {
    this.index.set(i);
  }

  protected next() {
    const n = this.movies().length;
    if (n > 1) this.index.update((i) => (i + 1) % n);
  }

  protected prev() {
    const n = this.movies().length;
    if (n > 1) this.index.update((i) => (i - 1 + n) % n);
  }

  protected onKey(e: KeyboardEvent) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    const el = e.target as HTMLElement | null;
    if (el?.closest('input, textarea, select, [contenteditable="true"]')) return;

    if (e.key === 'ArrowRight') this.next();
    else if (e.key === 'ArrowLeft') this.prev();
  }
}
