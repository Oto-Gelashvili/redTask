import { Component, inject, signal } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Icon } from '../../../shared/icon/icon';
import { ApiError } from '../../../models/api-error';

@Component({
  imports: [ReactiveFormsModule, Icon],
  selector: 'app-log-in',
  styleUrl: './log-in.css',
  templateUrl: './log-in.html',
})
export class LogIn {
  protected readonly modalService = inject(ModalService);
  private readonly authService = inject(AuthService);

  protected isLoading = signal(false);
  protected generalError = signal<string | null>(null);

  protected logInForm = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
  });

  protected getIsBtnDisabled(): boolean {
    if (this.isLoading()) return true;

    const form = this.logInForm;

    return form.invalid;
  }

  protected async onSubmit() {
    const v = this.logInForm.value;

    this.isLoading.set(true);
    this.generalError.set(null);

    try {
      await this.authService.logIn({ email: v.email!, password: v.password! });
      this.modalService.closeAll();
    } catch (err: ApiError | any) {
      if (err.status === 401) {
        this.generalError.set(err.message);
      } else if (err.status === 422) {
        this.mapServerErrors(err.errors);
      } else {
        this.generalError.set('Something went wrong. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
  private mapServerErrors(errors: Record<string, string[]> = {}) {
    for (const [field, messages] of Object.entries(errors)) {
      const control = this.logInForm.get(field);

      if (control) {
        control.setErrors({ server: messages[0] });
        control.markAsTouched();
      }
    }
  }
}
