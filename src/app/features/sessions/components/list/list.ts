import { Component, input } from '@angular/core';
import { Sorter } from './components/sorter/sorter';
import { SessionsResponse } from '../../../../models/session';
import { SessionCard } from './components/session-card/session-card';
import { DragScroll } from '../../../../shared/directives/drag-scroll';

@Component({
  imports: [Sorter, SessionCard, DragScroll],
  selector: 'app-list',
  styleUrl: './list.css',
  templateUrl: './list.html',
})
export class List {
  readonly response = input.required<SessionsResponse>();
}
