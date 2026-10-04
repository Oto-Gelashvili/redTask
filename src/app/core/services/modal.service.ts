import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly auth = inject(AuthService);

  isSignUpOpen = signal(false);
  isLogInOpen = signal(false);

  openSignUp() {
    this.isLogInOpen.set(false);
    this.isSignUpOpen.set(true);
  }

  openLogIn() {
    this.isSignUpOpen.set(false);
    this.isLogInOpen.set(true);
  }

  closeAll() {
    this.isSignUpOpen.set(false);
    this.isLogInOpen.set(false);
    this.auth.cancelLoginWait();
  }
}
