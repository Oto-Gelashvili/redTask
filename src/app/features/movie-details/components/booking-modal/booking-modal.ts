import { DOCUMENT, DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../../core/services/booking.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FilterOptionsService } from '../../../../core/services/filter-options.service';
import { Session, SessionMovie } from '../../../../models/session';
import { Hold, Order, Seat, SeatMap } from '../../../../models/booking';
import { ApiError } from '../../../../models/api-error';
import { NotificationService } from '../../../../core/services/notification.service';
import { applyServerErrors } from '../../../../shared/utils';
import { Loader } from '../../../../shared/components/loader/loader';
const MAX_SEATS = 3;
const EXPIRED_MESSAGE = 'Your hold time expired. Please re-select your seats.';
const TYPE_ORDER = ['child', 'student', 'adult'];

type Step = 'seats' | 'checkout' | 'done';
type MapState = 'loading' | 'ready' | 'error';
type CellStatus = 'available' | 'selected' | 'sold' | 'held' | 'gap';
type Picked = { id: number; code: string; section: string; ticketType: string };
type Notice = { kind: 'error' | 'warning'; text: string; profileLink?: boolean };
type TicketOption = { slug: string; name: string; ratio: number; blockedMinAge: number | null };

// ---------- helpers ----------
const strip = (v: unknown) => String(v ?? '').replace(/\s+/g, '');

const pattern =
  (re: RegExp, key: string): ValidatorFn =>
  (c) =>
    !c.value || re.test(strip(c.value)) ? null : { [key]: true };

export const futureExpiry: ValidatorFn = (c) => {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(String(c.value ?? ''));
  if (!m) return c.value ? { expiryFormat: true } : null;

  const now = new Date();
  const currentYM = now.getFullYear() * 100 + (now.getMonth() + 1);
  const inputYM = (2000 + +m[2]) * 100 + +m[1];

  return inputYM >= currentYM ? null : { expiryPast: true };
};

function joinCodes(codes: string[]) {
  return codes.length < 2
    ? (codes[0] ?? '')
    : `${codes.slice(0, -1).join(', ')} and ${codes[codes.length - 1]}`;
}

function firstError(errors: Record<string, string[] | string>) {
  const first = Object.values(errors)[0];
  return Array.isArray(first) ? first[0] : first;
}

export function ticketSummary(items: { ticketType: { name: string } }[]) {
  const counts = new Map<string, number>();
  for (const i of items) counts.set(i.ticketType.name, (counts.get(i.ticketType.name) ?? 0) + 1);
  return [...counts].map(([name, n]) => `${n} x ${name}`).join(', ');
}

@Component({
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, RouterLink, Loader],
  selector: 'app-booking-modal',
  styleUrl: './booking-modal.css',
  templateUrl: './booking-modal.html',
  host: { '(document:keydown.escape)': 'close()' },
})
export class BookingModal {
  private readonly booking = inject(BookingService);
  private readonly noty = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly filterOptions = inject(FilterOptionsService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly document = inject(DOCUMENT);

  readonly session = input.required<Session>();
  readonly movie = input.required<SessionMovie>();
  readonly closed = output<void>();

  protected readonly maxSeats = MAX_SEATS;
  protected readonly step = signal<Step>('seats');
  protected readonly notice = signal<Notice | null>(null);

  // ----- seat map -----
  protected readonly map = signal<SeatMap | null>(null);
  protected readonly mapState = signal<MapState>('loading');
  private readonly lostCodes = signal<Set<number | string>>(new Set());
  private mapRequestId = 0;

  // ----- selection / hold -----
  protected readonly selection = signal<Picked[]>([]);
  protected readonly hold = signal<Hold | null>(null);
  protected readonly holding = signal(false);

  // ----- checkout -----
  protected readonly submitting = signal(false);
  protected readonly order = signal<Order | null>(null);
  protected readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, pattern(/^(\+?995)?5\d{8}$/, 'mobile')]],
    cardNumber: ['', [Validators.required, pattern(/^\d{16}$/, 'card')]],
    expiry: ['', [Validators.required, futureExpiry]],
    cvv: ['', [Validators.required, pattern(/^\d{3}$/, 'cvv')]],
  });

  // ----- countdown (driven by expiresAt, never by secondsRemaining) -----
  private readonly expiresAtMs = signal<number | null>(null);
  private readonly now = signal(Date.now());
  private tick: ReturnType<typeof setInterval> | undefined;

  protected readonly remaining = computed(() => {
    const end = this.expiresAtMs();
    return end === null ? null : Math.max(0, Math.ceil((end - this.now()) / 1000));
  });
  protected readonly timerText = computed(() => {
    const r = this.remaining() ?? 0;
    return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}`;
  });

  // ----- ticket types -----
  protected readonly ticketOptions = computed<TicketOption[]>(() =>
    this.filterOptions.ticketTypes().map((t) => ({
      slug: t.slug,
      name: t.name,
      ratio: t.priceRatio > 1 ? t.priceRatio / 100 : t.priceRatio,
      note: t.note,
      blockedMinAge: t.blockedFromRatingAge ?? null,
    })),
  );

  protected readonly visibleTypes = computed(() => {
    const minAge = this.movie().ageRating.minAge;
    return this.ticketOptions()
      .filter((t) => t.blockedMinAge === null || minAge < t.blockedMinAge)
      .sort((a, b) => TYPE_ORDER.indexOf(a.slug) - TYPE_ORDER.indexOf(b.slug));
  });

  // ----- derived view state -----
  protected readonly layout = computed(() => {
    const selected = new Set(this.selection().map((s) => s.id));
    const lost = this.lostCodes();

    return (this.map()?.sections ?? []).map((section) => ({
      name: section.name,
      range: section.rows.length
        ? `${section.rows[0].label}–${section.rows[section.rows.length - 1].label}`
        : '',
      rows: section.rows.map((row) => ({
        label: row.label,
        cells: row.seats.map((seat) => ({
          seat,
          status: this.statusOf(seat, selected, lost),
        })),
      })),
    }));
  });

  protected readonly lines = computed(() =>
    this.selection().map((s) => ({ ...s, price: this.priceFor(s.ticketType) })),
  );
  protected readonly subtotal = computed(
    () => Math.round(this.lines().reduce((sum, l) => sum + l.price, 0) * 100) / 100,
  );

  protected readonly violations = computed(() =>
    this.selection()
      .filter((s) => !this.visibleTypes().some((t) => t.slug === s.ticketType))
      .map((s) => ({
        code: s.code,
        reason: `${s.ticketType} tickets aren't available for ${this.movie().ageRating.code} films.`,
      })),
  );

  protected readonly ageBlock = computed(() => {
    const user = this.auth.user();
    const { minAge, code } = this.movie().ageRating;
    if (!user || user.age == null || user.age >= minAge) return null;
    return `This film is rated ${code}. You cannot buy tickets for it with this account.`;
  });

  protected readonly canProceed = computed(
    () =>
      this.step() === 'seats' &&
      this.mapState() === 'ready' &&
      !this.holding() &&
      this.selection().length > 0 &&
      this.violations().length === 0 &&
      !this.ageBlock(),
  );

  protected ticketSummary = ticketSummary;

  constructor() {
    const destroyRef = inject(DestroyRef);

    // if modla is open, prevent page from scrolling
    const body = this.document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    const user = this.auth.user();
    if (user) {
      this.form.patchValue({
        fullName: user.fullName ?? '',
        email: user.email ?? '',
        mobileNumber: user.mobileNumber ?? '',
      });
    }

    // countdown hits zero
    effect(() => {
      if (this.remaining() === 0 && this.step() !== 'done') untracked(() => this.expire());
    });

    destroyRef.onDestroy(() => {
      body.style.overflow = previousOverflow;
      this.stopTimer();
      // closed without paying: give the seats back immediately
      const hold = this.hold();
      if (hold && this.step() !== 'done') {
        this.booking.releaseHold(hold.holdId).catch(() => {});
        this.clearStoredHold();
      }
    });
  }

  // =========================================================
  // init / seat map
  // =========================================================
  ngOnInit() {
    void this.init();
  }
  private async init() {
    const stored = localStorage.getItem(this.storageKey());
    await Promise.all([this.loadMap(), stored ? this.restoreHold(stored) : undefined]);
  }

  protected async loadMap() {
    const id = ++this.mapRequestId;
    if (!this.map()) this.mapState.set('loading');

    try {
      const res = await this.booking.getSeats(this.session().id);
      if (id !== this.mapRequestId) return;

      this.map.set(res.data);
      this.lostCodes.set(new Set());
      this.mapState.set('ready');

      // drop selected seats that can no longer be picked
      const pickable = new Set(
        res.data.sections
          .flatMap((s) => s.rows.flatMap((r) => r.seats))
          .filter((s) => s.state === 'available' || s.isMine)
          .map((s) => s.id),
      );
      this.selection.update((list) => list.filter((p) => pickable.has(p.id)));
    } catch {
      if (id !== this.mapRequestId) return;
      if (!this.map()) this.mapState.set('error'); // keep showing the old map on a failed refetch
    }
  }

  private async restoreHold(holdId: string) {
    try {
      const { data } = await this.booking.getHold(holdId);
      if (data.sessionId !== this.session().id) throw new Error('other session');

      if (!data.isLive) {
        this.clearStoredHold();
        this.noty.showError('Your previous hold has expired. Please re-select your seats.');
        return;
      }
      this.applyHold(data);
      this.selection.set(
        data.seats.map((s) => ({
          id: s.seatId,
          code: s.code,
          section: '',
          ticketType: s.ticketType.slug,
        })),
      );
    } catch {
      this.clearStoredHold();
    }
  }

  private statusOf(seat: Seat, selected: Set<number>, lost: Set<number | string>): CellStatus {
    if (seat.state === 'unavailable') return 'gap';
    if (selected.has(seat.id)) return 'selected';
    if (seat.state === 'sold' || lost.has(seat.code)) return 'sold';
    if (seat.state === 'held' && !seat.isMine) return 'held';
    return 'available';
  }

  protected seatAria(cell: { seat: Seat; status: CellStatus }) {
    const suffix =
      cell.status === 'sold' ? ' (sold)' : cell.status === 'held' ? ' (held by another user)' : '';
    return `Seat ${cell.seat.code}${suffix}`;
  }

  // =========================================================
  // selection
  // =========================================================
  protected toggleSeat(seat: Seat, sectionName: string) {
    const current = this.selection();

    if (current.some((s) => s.id === seat.id)) {
      this.selection.set(current.filter((s) => s.id !== seat.id));
      this.notice.set(null);
      return;
    }
    if (current.length >= MAX_SEATS) {
      this.notice.set({
        kind: 'warning',
        text: `You can select up to ${MAX_SEATS} seats per order.`,
      });
      return;
    }
    this.notice.set(null);
    this.selection.update((list) => [
      ...list,
      { id: seat.id, code: seat.code, section: sectionName, ticketType: this.defaultType() },
    ]);
  }

  protected removeSeat(id: number) {
    this.selection.update((list) => list.filter((s) => s.id !== id));
  }

  protected setType(id: number, slug: string) {
    this.selection.update((list) =>
      list.map((s) => (s.id === id ? { ...s, ticketType: slug } : s)),
    );
  }

  private defaultType() {
    const types = this.visibleTypes();
    return types.find((t) => t.slug === 'adult')?.slug ?? types[0]?.slug ?? 'adult';
  }

  private priceFor(slug: string) {
    const ratio = this.ticketOptions().find((t) => t.slug === slug)?.ratio ?? 1;
    return Math.round(this.session().price * ratio * 100) / 100;
  }

  // =========================================================
  // step 1 -> step 2 (hold)
  // =========================================================
  protected async next() {
    if (!this.canProceed()) return;

    // nothing changed since the last hold (user went back and forth): don't re-hold
    const existing = this.hold();
    if (existing && this.holdSignature(existing) === this.selectionSignature()) {
      this.step.set('checkout');
      return;
    }

    this.holding.set(true);
    this.notice.set(null);
    try {
      const res = await this.booking.createHold(
        this.session().id,
        this.selection().map((s) => ({ seatId: s.id, ticketType: s.ticketType })),
      );
      this.applyHold(res.data);
      this.step.set('checkout');
    } catch (err) {
      this.onHoldError(err as ApiError);
    } finally {
      this.holding.set(false);
    }
  }

  private selectionSignature() {
    return this.selection()
      .map((s) => `${s.id}:${s.ticketType}`)
      .sort()
      .join(',');
  }
  private holdSignature(hold: Hold) {
    return hold.seats
      .map((s) => `${s.seatId}:${s.ticketType.slug}`)
      .sort()
      .join(',');
  }

  private applyHold(hold: Hold) {
    this.hold.set(hold);
    localStorage.setItem(this.storageKey(), hold.holdId);
    this.startTimer(hold.expiresAt);
  }

  private onHoldError(err: ApiError) {
    if (err.status === 409) {
      this.recoverFromConflict(err.contested ?? [], err.message);
      return;
    }
    if (err.status === 422) {
      // errors present => field validation; message only => a booking rule
      const text = (err.errors && firstError(err.errors)) || err.message;
      this.notice.set({
        kind: 'error',
        text,
        profileLink: !err.errors && /profile/i.test(text),
      });
      return;
    }
    this.notice.set({ kind: 'error', text: "Couldn't reserve your seats. Please try again." });
  }

  /** Someone else took seats: mark them sold, keep the rest, refetch. */
  private recoverFromConflict(codes: string[], fallback: string) {
    const lost = new Set(codes);
    this.lostCodes.update((s) => new Set([...s, ...codes]));
    this.selection.update((list) => list.filter((s) => !lost.has(s.code)));

    this.stopTimer();
    this.hold.set(null);
    this.clearStoredHold();
    this.step.set('seats');

    const kept = this.selection().length;
    this.notice.set({
      kind: 'error',
      text: codes.length
        ? `${joinCodes(codes)} ${codes.length > 1 ? 'were' : 'was'} just taken by someone else. ` +
          (kept ? 'Your other seats are still selected.' : 'Please pick different seats.')
        : fallback,
    });
    void this.loadMap();
  }

  // =========================================================
  // step 2 -> pay
  // =========================================================
  protected backToSeats() {
    // keep the hold: the user still wants these seats
    this.step.set('seats');
    this.notice.set(null);
  }

  protected async pay() {
    if (this.submitting()) return;
    this.form.markAllAsTouched();
    const hold = this.hold();
    if (this.form.invalid || !hold) return;

    this.submitting.set(true);
    this.notice.set(null);
    try {
      const res = await this.booking.createOrder({
        holdId: hold.holdId,
        ...this.form.getRawValue(),
      });
      this.stopTimer();
      this.hold.set(null);
      this.clearStoredHold();
      this.order.set(res.data);
      this.step.set('done');
    } catch (err) {
      this.onOrderError(err as ApiError);
    } finally {
      this.submitting.set(false);
    }
  }

  private onOrderError(err: ApiError) {
    if (err.status === 422) {
      if (err.errors) {
        applyServerErrors(this.form, err.errors);

        const hasFieldMatch = Object.keys(err.errors).some((k) => this.form.get(k));
        if (!hasFieldMatch) this.notice.set({ kind: 'error', text: firstError(err.errors) });
      } else {
        this.expire(err.message);
      }
      return;
    }
    if (err.status === 409) {
      this.recoverFromConflict(err.contested ?? [], err.message);
      return;
    }
    if (err.status === 403) {
      this.notice.set({ kind: 'error', text: err.message });
      return;
    }
    this.notice.set({ kind: 'error', text: "Payment didn't go through. Please try again." });
  }

  // =========================================================
  // form helpers
  // =========================================================

  protected onCardInput(event: Event) {
    const el = event.target as HTMLInputElement;
    const v = el.value
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})(?=.)/g, '$1 ');
    el.value = v;
    this.form.controls.cardNumber.setValue(v);
  }

  protected onExpiryInput(event: Event) {
    const el = event.target as HTMLInputElement;
    const d = el.value.replace(/\D/g, '').slice(0, 4);
    const v = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
    el.value = v;
    this.form.controls.expiry.setValue(v);
  }

  protected onCvvInput(event: Event) {
    const el = event.target as HTMLInputElement;
    el.value = el.value.replace(/\D/g, '').slice(0, 3);
    this.form.controls.cvv.setValue(el.value);
  }

  // =========================================================
  // timer / expiry / close
  // =========================================================
  private startTimer(expiresAt: string) {
    clearInterval(this.tick);
    this.expiresAtMs.set(Date.parse(expiresAt));
    this.now.set(Date.now());
    this.tick = setInterval(() => this.now.set(Date.now()), 1000);
  }

  private stopTimer() {
    clearInterval(this.tick);
    this.expiresAtMs.set(null);
  }

  private expire(message = EXPIRED_MESSAGE) {
    this.stopTimer();
    this.hold.set(null);
    this.clearStoredHold();
    this.selection.set([]);
    this.step.set('seats');
    this.notice.set({ kind: 'warning', text: message });
    void this.loadMap();
  }

  protected close() {
    if (this.submitting()) return;
    this.closed.emit();
  }

  private storageKey() {
    return `booking-hold:${this.session().id}`;
  }
  private clearStoredHold() {
    localStorage.removeItem(this.storageKey());
  }
}
