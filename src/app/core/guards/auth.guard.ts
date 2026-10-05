import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const modal = inject(ModalService);
  const noty = inject(NotificationService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  modal.openLogIn();
  noty.showError('You must be logged in to access this page.');
  return router.createUrlTree(['/']);
};
