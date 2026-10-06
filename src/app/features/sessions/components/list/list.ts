import { Component, input, output } from '@angular/core';
import { Sorter } from './components/sorter/sorter';
import { SessionsResponse } from '../../../../models/session';
import { SessionCard } from './components/session-card/session-card';
import { DragScroll } from '../../../../shared/directives/drag-scroll';
import { Pagination } from './components/pagination/pagination';

@Component({
  imports: [Sorter, SessionCard, DragScroll, Pagination],
  selector: 'app-list',
  styleUrl: './list.css',
  templateUrl: './list.html',
})
export class List {
  readonly response = input.required<SessionsResponse>();
  readonly pageChange = output<number>();
}
