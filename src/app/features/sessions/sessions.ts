import { Component, inject, signal } from '@angular/core';
import { Filter } from './components/filter/filter';
import { List } from './components/list/list';
import { SessionsService } from '../../core/services/sessions.service';
import { SessionsResponse } from '../../models/session';

@Component({
  imports: [Filter, List],
  selector: 'app-sessions',
  styleUrl: './sessions.css',
  templateUrl: './sessions.html',
})
export class Sessions {
  private readonly sessionsService = inject(SessionsService);

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
    } catch {
      this.hasError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }
}
