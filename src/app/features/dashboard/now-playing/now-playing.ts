import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoviesService } from '../../../core/services/movies.service';
import { NowPlayingMovie } from '../../../models/movie';
import { DragScroll } from '../../../shared/directives/drag-scroll';

type State = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  selector: 'app-now-playing',
  imports: [RouterLink, DragScroll],
  templateUrl: './now-playing.html',
  styleUrl: './now-playing.css',
})
export class NowPlaying {
  private readonly moviesService = inject(MoviesService);

  protected readonly movies = signal<NowPlayingMovie[]>([]);
  protected readonly state = signal<State>('loading');
  protected readonly skeletons = [1, 2, 3, 4, 5, 6];

  constructor() {
    void this.load();
  }

  protected async load() {
    this.state.set('loading');
    try {
      const res = await this.moviesService.getNowPlaying(8);
      this.movies.set(res.data);
      this.state.set(res.data.length ? 'ready' : 'empty');
    } catch {
      this.state.set('error');
    }
  }
}
