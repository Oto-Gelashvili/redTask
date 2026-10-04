import { Component, inject, signal } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Icon } from '../../../shared/icon/icon';

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
      const res = await this.authService.logIn({
        email: v.email!,
        password: v.password!,
      });
      this.authService.setSession(res.data.user, res.data.token);
      this.modalService.closeAll();
    } catch (err: any) {
      if (err.status === 401) {
        this.generalError.set(err.error.message);
      } else {
        this.generalError.set('Something went wrong. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
