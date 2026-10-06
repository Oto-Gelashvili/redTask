import { Component, input } from '@angular/core';
import { Session } from '../../../../../../models/session';

@Component({
  imports: [],
  selector: 'app-session-card',
  styleUrl: './session-card.css',
  templateUrl: './session-card.html',
})
export class SessionCard {
  readonly session = input.required<Session>();
}
