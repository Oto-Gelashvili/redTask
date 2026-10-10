import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MoviesService } from '../../core/services/movies.service';
import { ApiError } from '../../models/api-error';
import { MovieDetail, VenueSessions } from '../../models/movie';
import { Session } from '../../models/session';
import { toLocalISODate } from '../../shared/utils';
import { ModalService } from '../../core/services/modal.service';
import { BookingModal } from './components/booking-modal/booking-modal';

const DAYS_SHOWN = 7;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
type MovieState = 'loading' | 'ready' | 'notFound' | 'error';
type DayOption = { iso: string; weekday: string; day: number; empty: boolean };
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
  imports: [DatePipe, BookingModal],
  selector: 'app-movie-details',
  styleUrl: './movie-details.css',
  templateUrl: './movie-details.html',
})
export class MovieDetails {
  private readonly modal = inject(ModalService);
  protected readonly activeSession = signal<Session | null>(null);

  private readonly moviesService = inject(MoviesService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // bound from the URL by withComponentInputBinding()
  readonly slug = input.required<string>();
  readonly sessionParam = input<string | undefined>(undefined, { alias: 'session' });
  readonly dateParam = input<string | undefined>(undefined, { alias: 'date' });

  protected readonly movie = signal<MovieDetail | null>(null);
  protected readonly movieState = signal<MovieState>('loading');

  private readonly groups = signal<VenueSessions[]>([]);
  protected readonly sessionsLoading = signal(false);
  protected readonly sessionsError = signal<{ message: string; retryable: boolean } | null>(null);

  private movieRequestId = 0;
  private sessionsRequestId = 0;

  private readonly allSessions = computed(() =>
    this.venues().flatMap((v) => v.halls.flatMap((h) => h.sessions)),
  );

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
        empty: !available.has(iso),
      };
    });
  });

  protected readonly selectedDate = computed(() => {
    const requested = this.dateParam();
    if (requested && ISO_DATE.test(requested)) return requested;

    const days = this.days();
    return (days.find((d) => !d.empty) ?? days[0]).iso;
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
    effect(() => {
      const id = Number(this.sessionParam());
      if (!id || this.movieState() !== 'ready' || this.sessionsLoading()) return;

      const session = this.allSessions().find((s) => s.id === id);
      if (!session) return;

      untracked(() => this.openFromLink(session));
    });
  }
  private openFromLink(session: Session) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { session: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    void this.openSession(session);
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
    this.sessionsError.set(null);

    if (!date) {
      this.sessionsLoading.set(false);
      return;
    }

    this.sessionsLoading.set(true);
    try {
      const res = await this.moviesService.getSessions(slug, date);
      if (id !== this.sessionsRequestId) return;
      this.groups.set(res.data);
    } catch (err) {
      if (id !== this.sessionsRequestId) return;
      const apiError = err as ApiError;
      const fromServer = apiError.status >= 400 && apiError.status < 500;
      this.sessionsError.set({
        message: fromServer && apiError.message ? apiError.message : "Couldn't load sessions.",
        retryable: !fromServer,
      });
    } finally {
      if (id === this.sessionsRequestId) this.sessionsLoading.set(false);
    }
  }

  protected selectDate(iso: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { date: iso, session: null },
      queryParamsHandling: 'merge',
    });
  }

  protected isDisabled(session: Session) {
    return session.isSoldOut || !!this.restriction();
  }

  protected async openSession(session: Session) {
    if (this.isDisabled(session)) return;

    if (!this.auth.isAuthenticated()) {
      this.modal.openLogIn();
      const loggedIn = await this.auth.waitForLogin();
      if (!loggedIn || this.isDisabled(session)) return;
    }
    this.activeSession.set(session);
  }
}
