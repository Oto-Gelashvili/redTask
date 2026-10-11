import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../core/services/modal.service';
import { MoviesService } from '../../../core/services/movies.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiError } from '../../../models/api-error';
import { ComingSoonMovie } from '../../../models/movie';
import { DragScroll } from '../../../shared/directives/drag-scroll';

type State = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  selector: 'app-coming-soon',
  imports: [DatePipe, RouterLink, DragScroll],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.css',
})
export class ComingSoon {
  private readonly moviesService = inject(MoviesService);
  private readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);
  private readonly noty = inject(NotificationService);

  protected readonly movies = signal<ComingSoonMovie[]>([]);
  protected readonly state = signal<State>('loading');
  protected readonly notified = signal<ReadonlySet<number>>(new Set());
  protected readonly pending = signal<ReadonlySet<number>>(new Set());
  protected readonly skeletons = [1, 2, 3, 4];

  constructor() {
    void this.load();
  }

  protected async load() {
    this.state.set('loading');
    try {
      const res = await this.moviesService.getComingSoon(8);
      this.movies.set(res.data);
      this.notified.set(new Set(res.data.filter((m) => m.isNotified).map((m) => m.id)));
      this.state.set(res.data.length ? 'ready' : 'empty');
    } catch {
      this.state.set('error');
    }
  }

  protected async notify(m: ComingSoonMovie) {
    if (this.notified().has(m.id) || this.pending().has(m.id)) return;
    this.setPending(m.id, true);

    try {
      if (!this.auth.isAuthenticated()) {
        this.modal.openLogIn();
        if (!(await this.auth.waitForLogin())) return;
      }
      await this.moviesService.notify(m.slug);

      this.notified.update((s) => new Set(s).add(m.id));
      this.noty.showSuccess(`We'll let you know when ${m.title} is out.`);
    } catch (e) {
      const err = e as ApiError;
      if (err.status !== 401) {
        this.noty.showError(err.message ?? 'Could not subscribe. Please try again.');
      }
    } finally {
      this.setPending(m.id, false);
    }
  }

  private setPending(id: number, on: boolean) {
    this.pending.update((s) => {
      const next = new Set(s);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }
}
