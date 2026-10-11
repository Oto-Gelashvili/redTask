import { Component, inject } from '@angular/core';
import { RecentlyViewedService } from '../../../core/services/recently-viewed.service';
import { RouterLink } from '@angular/router';
import { DragScroll } from '../../../shared/directives/drag-scroll';

@Component({
  imports: [RouterLink, DragScroll],
  selector: 'app-recently-viewed',
  styleUrl: './recently-viewed.css',
  templateUrl: './recently-viewed.html',
})
export class RecentlyViewed {
  protected readonly items = inject(RecentlyViewedService).items;
}
