import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiError } from '../../models/api-error';
import { applyServerErrors } from '../../shared/utils';
import { ProfileService } from '../../core/services/profile.service';
import { TicketsService } from '../../core/services/tickets.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-profile',
  providers: [TicketsService],
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile {
  private readonly profileService = inject(ProfileService);
  protected readonly ticketsService = inject(TicketsService);

  protected isLoading = signal(false);
  protected generalError = signal<string | null>(null);

  protected profileForm = new FormGroup({
    fullName: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]),
    mobile: new FormControl<string>('', [Validators.required]),
    birthDate: new FormControl<string>('', [Validators.required]),
    prefferedVenue: new FormControl<string>('', []),
  });
  constructor() {
    this.ticketsService.loadUpcoming();
  }
  protected getIsBtnDisabled(): boolean {
    if (this.isLoading()) return true;

    const form = this.profileForm;

    return form.invalid;
  }

  protected async onSubmit() {
    const v = this.profileForm.value;

    this.isLoading.set(true);
    this.generalError.set(null);

    try {
      await this.profileService.updateProfile({
        fullName: v.fullName!,
        mobile: v.mobile!,
        birthDate: v.birthDate!,
        prefferedVenue: v.prefferedVenue!,
      });
    } catch (err: ApiError | any) {
      if (err.status === 401) {
        this.generalError.set(err.message);
      } else if (err.status === 422) {
        applyServerErrors(this.profileForm, err.errors);
      } else {
        this.generalError.set('Something went wrong. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
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
