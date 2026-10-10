import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TicketsService } from '../../../core/services/tickets.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Loader } from '../../../shared/components/loader/loader';
import { ApiError } from '../../../models/api-error';
import { Order } from '../../../models/ticket';
type Tab = 'upcoming' | 'past';
const REFUND_CUTOFF_MS = 2 * 60 * 60 * 1000;

@Component({
  imports: [DatePipe, DecimalPipe, Loader],
  selector: 'app-my-tickets',
  styleUrl: './my-tickets.css',
  templateUrl: './my-tickets.html',
})
export class MyTickets {
  protected readonly tickets = inject(TicketsService);
  private readonly noty = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  private readonly tabsEl = viewChild.required<ElementRef<HTMLElement>>('tabsEl');
  private readonly upcomingEl = viewChild.required<ElementRef<HTMLElement>>('upcomingEl');
  private readonly pastEl = viewChild.required<ElementRef<HTMLElement>>('pastEl');

  protected readonly indicator = signal({ left: 0, width: 0 });
  protected readonly ready = signal(false);
  protected readonly tab = signal<Tab>('upcoming');
  protected readonly list = computed(() =>
    this.tab() === 'upcoming' ? this.tickets.upcoming() : this.tickets.past(),
  );

  protected readonly confirmingId = signal<number | null>(null);
  protected readonly refundingId = signal<number | null>(null);

  constructor() {
    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.moveToActive());
      observer.observe(this.upcomingEl().nativeElement);
      observer.observe(this.pastEl().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());

      this.document.fonts.ready.then(() => {
        this.moveToActive();
        requestAnimationFrame(() => this.ready.set(true));
      });
    });
  }
  protected setTab(tab: Tab) {
    this.tab.set(tab);
    this.confirmingId.set(null);
    this.moveToActive();
  }

  protected refundUntil(order: Order): Date {
    const { date, time } = order.session;
    return new Date(new Date(`${date}T${time}:00`).getTime() - REFUND_CUTOFF_MS);
  }

  protected askRefund(order: Order) {
    if (order.isRefundable) this.confirmingId.set(order.id);
  }

  protected cancelRefund() {
    this.confirmingId.set(null);
  }

  protected async confirmRefund(order: Order) {
    if (this.refundingId() !== null) return;
    this.refundingId.set(order.id);
    try {
      await this.tickets.refund(order);
      this.noty.showSuccess('Refunded');
    } catch (err) {
      const e = err as ApiError;
      if (e.status === 422 || e.status === 403) {
        this.noty.showError(e.message);
        if (e.status === 422) void this.tickets.load();
      } else if (e.status !== 401) {
        this.noty.showError("Couldn't process the refund. Please try again.");
      }
    } finally {
      this.refundingId.set(null);
      this.confirmingId.set(null);
    }
  }
  protected moveTo(el: HTMLElement) {
    this.indicator.set({ left: el.offsetLeft, width: el.offsetWidth });
  }

  protected moveToActive() {
    const el = this.tab() === 'upcoming' ? this.upcomingEl() : this.pastEl();
    this.moveTo(el.nativeElement);
  }
}
