import { Component, effect, inject, signal } from '@angular/core';
import { ProfileService } from '../../../core/services/profile.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiError } from '../../../models/api-error';
import { applyServerErrors } from '../../../shared/utils';
import { Loader } from '../../../shared/components/loader/loader';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  imports: [ReactiveFormsModule, Loader],
  selector: 'app-personal-info',
  styleUrl: './personal-info.css',
  templateUrl: './personal-info.html',
})
export class PersonalInfo {
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);

  protected isLoading = signal(false);
  protected generalError = signal<string | null>(null);

  protected profileForm = new FormGroup({
    fullName: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]),
    email: new FormControl<string>(''),
    mobileNumber: new FormControl<string>('', [Validators.required]),
    dateOfBirth: new FormControl<string>('', [Validators.required]),
    preferredVenueId: new FormControl<number | null>(null),
  });

  constructor() {
    effect(() => {
      const user = this.authService.user();
      if (!user) return;

      if (this.profileForm.dirty) return;

      this.profileForm.patchValue({
        fullName: user.fullName ?? '',
        email: user.email ?? '',
        mobileNumber: user.mobileNumber ?? '',
        dateOfBirth: user.dateOfBirth?.slice(0, 10) ?? '',
        preferredVenueId: user.preferredVenue?.id ?? null,
      });
    });
  }

  protected getIsBtnDisabled(): boolean {
    if (this.isLoading()) return true;

    const form = this.profileForm;

    return form.invalid;
  }

  protected async onSubmit() {
    const v = this.profileForm.value;
    const formData = new FormData();
    formData.append('fullName', v.fullName!);
    formData.append('mobileNumber', v.mobileNumber!);
    formData.append('dateOfBirth', v.dateOfBirth!);
    formData.append('preferredVenueId', v.preferredVenueId?.toString() ?? '');

    this.isLoading.set(true);
    this.generalError.set(null);

    try {
      await this.profileService.updateProfile(formData);
      this.profileForm.markAsPristine();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 422) {
        applyServerErrors(this.profileForm, apiError.errors);
      } else {
        this.generalError.set('Something went wrong. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
