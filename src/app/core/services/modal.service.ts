import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ModalService {
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
  }
}
