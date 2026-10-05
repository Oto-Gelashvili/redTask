import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TicketsService } from '../../core/services/tickets.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-profile',
  providers: [TicketsService],
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile {
  protected readonly ticketsService = inject(TicketsService);

  constructor() {
    this.ticketsService.loadUpcoming();
  }
  protected readonly indicator = signal({ left: 0, width: 0 });
  protected readonly ready = signal(false);
  private activeEl: HTMLElement | null = null;

  protected select(el: HTMLElement) {
    this.activeEl = el;
    this.moveTo(el);
    requestAnimationFrame(() => this.ready.set(true));
  }

  protected moveTo(el: HTMLElement) {
    this.indicator.set({ left: el.offsetLeft, width: el.offsetWidth });
  }

  protected moveToActive() {
    if (this.activeEl) this.moveTo(this.activeEl);
  }

  @HostListener('window:resize')
  onResize() {
    this.moveToActive();
  }
}
