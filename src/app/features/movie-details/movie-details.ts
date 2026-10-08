import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MoviesService } from '../../core/services/movies.service';
import { ApiError } from '../../models/api-error';
import { MovieDetail, VenueSessions } from '../../models/movie';
import { Session } from '../../models/session';
import { toLocalISODate } from '../../shared/utils';
import { Loader } from '../../shared/components/loader/loader';

const DAYS_SHOWN = 7;

type MovieState = 'loading' | 'ready' | 'notFound' | 'error';
type DayOption = { iso: string; weekday: string; day: number; disabled: boolean };
type HallGroup = { hallId: number; hallName: string; sessions: Session[] };

function groupByHall(sessions: Session[]): HallGroup[] {
  const halls = new Map<number, HallGroup>();
  for (const s of sessions) {
    let group = halls.get(s.hall.id);
    if (!group) {
      group = { hallId: s.hall.id, hallName: s.hall.name, sessions: [] };
      halls.set(s.hall.id, group);
    }
    group.sessions.push(s);
  }
  return [...halls.values()];
}

@Component({
  imports: [DatePipe, Loader],
  selector: 'app-movie-details',
  styleUrl: './movie-details.css',
  templateUrl: './movie-details.html',
})
export class MovieDetails {
  private readonly moviesService = inject(MoviesService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // bound from the URL by withComponentInputBinding()
  readonly slug = input.required<string>();
  readonly dateParam = input<string | undefined>(undefined, { alias: 'date' });

  protected readonly movie = signal<MovieDetail | null>(null);
  protected readonly movieState = signal<MovieState>('loading');

  private readonly groups = signal<VenueSessions[]>([]);
  protected readonly sessionsLoading = signal(false);
  protected readonly sessionsError = signal(false);

  private movieRequestId = 0;
  private sessionsRequestId = 0;

  protected readonly days = computed<DayOption[]>(() => {
    const available = new Set(this.movie()?.availableDates ?? []);
    const weekdayFmt = new Intl.DateTimeFormat('en', { weekday: 'short' });

    return Array.from({ length: DAYS_SHOWN }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = toLocalISODate(d);
      return {
        iso,
        weekday: weekdayFmt.format(d),
        day: d.getDate(),
        disabled: !available.has(iso),
      };
    });
  });

  protected readonly selectedDate = computed(() => {
    const days = this.days();
    const requested = days.find((d) => d.iso === this.dateParam() && !d.disabled);
    return (requested ?? days.find((d) => !d.disabled))?.iso ?? null;
  });

  protected readonly venues = computed(() =>
    this.groups().map((g) => ({ venue: g.venue, halls: groupByHall(g.sessions) })),
  );

  protected readonly restriction = computed(() => {
    const movie = this.movie();
    const user = this.auth.user();
    if (!movie || !user || user.age == null) return null;

    const { minAge, code } = movie.ageRating;
    if (user.age >= minAge) return null;
    return `This film is rated ${code}. You cannot buy tickets for it with this account.`;
  });

  protected readonly emptyMessage = computed(() => {
    if (this.movie()?.isComingSoon) {
      return 'This film is coming soon. Sessions will appear here once they are scheduled.';
    }
    if (this.selectedDate() === null) {
      return 'There are no upcoming sessions for this film in the next 7 days.';
    }
    return 'No sessions on this date. Try another day.';
  });

  constructor() {
    effect(() => {
      const slug = this.slug();
      untracked(() => this.loadMovie(slug));
    });

    effect(() => {
      const slug = this.slug();
      const date = this.selectedDate();
      untracked(() => this.loadSessions(slug, date));
    });
  }

  protected async loadMovie(slug: string) {
    const id = ++this.movieRequestId;
    this.movie.set(null);
    this.movieState.set('loading');

    try {
      const res = await this.moviesService.getMovie(slug);
      if (id !== this.movieRequestId) return;
      this.movie.set(res.data);
      this.movieState.set('ready');
    } catch (err) {
      if (id !== this.movieRequestId) return;
      this.movieState.set((err as ApiError).status === 404 ? 'notFound' : 'error');
    }
  }

  protected async loadSessions(slug: string, date: string | null) {
    const id = ++this.sessionsRequestId;
    this.groups.set([]);
    this.sessionsError.set(false);

    if (!date) {
      this.sessionsLoading.set(false);
      return;
    }

    this.sessionsLoading.set(true);
    try {
      const res = await this.moviesService.getSessions(slug, date);
      if (id !== this.sessionsRequestId) return;
      this.groups.set(res.data);
    } catch {
      if (id !== this.sessionsRequestId) return;
      this.sessionsError.set(true);
    } finally {
      if (id === this.sessionsRequestId) this.sessionsLoading.set(false);
    }
  }

  protected selectDate(iso: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date: iso },
      queryParamsHandling: 'merge',
    });
  }

  protected isDisabled(session: Session) {
    return session.isSoldOut || !!this.restriction();
  }

  protected openSession(session: Session) {
    if (this.isDisabled(session)) return;
    this.router.navigate(['/sessions', session.id, 'seats']);
  }
}
