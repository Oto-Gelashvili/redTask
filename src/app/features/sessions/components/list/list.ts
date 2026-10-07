import { Component, input, output } from '@angular/core';
import { Sorter } from './components/sorter/sorter';
import { SessionsResponse } from '../../../../models/session';
import { SessionCard } from './components/session-card/session-card';
import { DragScroll } from '../../../../shared/directives/drag-scroll';
import { Pagination } from './components/pagination/pagination';
import { RouterLink } from '@angular/router';

@Component({
  imports: [Sorter, SessionCard, DragScroll, Pagination, RouterLink],
  selector: 'app-list',
  styleUrl: './list.css',
  templateUrl: './list.html',
})
export class List {
  readonly response = input<SessionsResponse | null>(null);
  readonly sortValue = input<string>('');
  readonly sortChange = output<string>();
  readonly pageChange = output<number>();
  readonly hasError = input<boolean>(false);
  readonly errorContent = input<string | undefined>(undefined);
  readonly retry = output<void>();
}
