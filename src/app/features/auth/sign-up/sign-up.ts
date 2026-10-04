import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../core/services/modal.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ApiError } from '../../../models/api-error';
import { Icon } from '../../../shared/icon/icon';
import { Loader } from '../../../shared/components/loader/loader';
import { applyServerErrors } from '../../../shared/utils';

@Component({
  imports: [Icon, ReactiveFormsModule, Loader],
  selector: 'app-sign-up',
  styleUrl: './sign-up.css',
  templateUrl: './sign-up.html',
})
export class SignUp {
  protected readonly modalService = inject(ModalService);
  private readonly authService = inject(AuthService);

  protected isLoading = signal(false);
  protected generalError = signal<string | null>(null);
  // protected selectedFile = signal<File | null>(null);
  protected matchesPassword: ValidatorFn = (control) => {
    if (!control.parent) return null;
    return control.value === control.parent.get('password')?.value ? null : { mismatch: true };
  };

  protected signUpform = new FormGroup({
    username: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    password_confirmation: new FormControl<string>('', [Validators.required, this.matchesPassword]),
    // avatar: new FormControl(''),
  });

  constructor() {
    this.signUpform.controls.password.valueChanges.subscribe(() =>
      this.signUpform.controls.password_confirmation.updateValueAndValidity(),
    );
  }
  protected passwordError(): string | null {
    const { password, password_confirmation: confirm } = this.signUpform.controls;

    if (password.invalid && password.touched) {
      return password.errors?.['server'] ?? 'Min 3 characters required';
    }
    if (confirm.invalid && confirm.touched) {
      return (
        confirm.errors?.['server'] ??
        (confirm.errors?.['mismatch'] ? 'Passwords should match' : 'Please confirm your password')
      );
    }
    return null;
  }
  protected getIsBtnDisabled(): boolean {
    return this.isLoading() || this.signUpform.invalid;
  }

  protected async onSubmit() {
    const v = this.signUpform.value;
    const formData = new FormData();
    formData.append('username', v.username!);
    formData.append('email', v.email!);
    formData.append('password', v.password!);
    formData.append('password_confirmation', v.password_confirmation!);
    // if (this.selectedFile()) {
    //   formData.append('avatar', this.selectedFile()!);
    // }

    this.isLoading.set(true);
    this.generalError.set(null);

    try {
      await this.authService.signUp(formData);
      this.modalService.closeAll();
    } catch (err: ApiError | any) {
      if (err.status === 422) {
        applyServerErrors(this.signUpform, err.errors);
      } else {
        this.generalError.set('Something went wrong. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
