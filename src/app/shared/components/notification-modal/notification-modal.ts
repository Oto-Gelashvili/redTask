import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-modal',
  imports: [],
  templateUrl: './notification-modal.html',
  styleUrl: './notification-modal.css',
})
export class NotificationModal {
  private readonly notifyService = inject(NotificationService);
  readonly notifications = this.notifyService.notifications;
  readonly confirmation = this.notifyService.confirmation;

  resolveConfirm(result: boolean) {
    this.notifyService.resolveConfirm(result);
  }
}
