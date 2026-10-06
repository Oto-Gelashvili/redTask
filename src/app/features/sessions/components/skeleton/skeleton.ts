import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-skeleton',
  styleUrl: './skeleton.css',
  templateUrl: './skeleton.html',
})
export class Skeleton {
  protected readonly groups = [1, 2, 3, 4, 5];
  protected readonly cards = [1, 2, 3, 4, 5];
}
