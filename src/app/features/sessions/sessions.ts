import { Component, inject, signal } from '@angular/core';
import { Filter } from './components/filter/filter';
import { List } from './components/list/list';
import { SessionsService } from '../../core/services/sessions.service';
import { SessionsResponse } from '../../models/session';
import { ApiError } from '../../models/api-error';
import { NotificationService } from '../../core/services/notification.service';
import { Skeleton } from './components/skeleton/skeleton';

@Component({
  imports: [Filter, List, Skeleton],
  selector: 'app-sessions',
  styleUrl: './sessions.css',
  templateUrl: './sessions.html',
})
export class Sessions {
  private readonly sessionsService = inject(SessionsService);
  private readonly notificationService = inject(NotificationService);

  protected readonly data = signal<SessionsResponse | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);

  constructor() {
    this.load();
  }

  protected async load() {
    this.isLoading.set(true);
    this.hasError.set(false);

    try {
      const res = await this.sessionsService.getSessions();
      this.data.set(res);
    } catch (err) {
      const apiError = err as ApiError;
      this.hasError.set(true);
      this.notificationService.showError(
        apiError.status === 422 && apiError.message
          ? apiError.message
          : 'Could not load sessions. Please try again.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
