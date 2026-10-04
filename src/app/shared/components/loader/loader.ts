import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-loader',
  styleUrl: './loader.css',
  templateUrl: './loader.html',
})
export class Loader {
  size = input<number>(18);
  innerColor = input<string>('var(--text-primary)');
}
