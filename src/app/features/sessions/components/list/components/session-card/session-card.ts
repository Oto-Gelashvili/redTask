import { Component, input } from '@angular/core';
import { Session } from '../../../../../../models/session';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-session-card',
  styleUrl: './session-card.css',
  templateUrl: './session-card.html',
})
export class SessionCard {
  readonly session = input.required<Session>();
  readonly movieSlug = input.required<string>();
}
