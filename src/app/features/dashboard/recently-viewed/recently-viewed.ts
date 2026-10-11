import { Component, inject } from '@angular/core';
import { RecentlyViewedService } from '../../../core/services/recently-viewed.service';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-recently-viewed',
  styleUrl: './recently-viewed.css',
  templateUrl: './recently-viewed.html',
})
export class RecentlyViewed {
  protected readonly items = inject(RecentlyViewedService).items;
}
