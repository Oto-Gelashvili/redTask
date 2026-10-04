import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.css',
  host: { 'aria-hidden': 'true' },
})
export class Icon {
  name = input.required<string>();
  size = input.required<number>();
}
