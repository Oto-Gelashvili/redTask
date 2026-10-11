import { Component } from '@angular/core';
import { Hero } from './hero/hero';
import { RecentlyViewed } from './recently-viewed/recently-viewed';
import { NowPlaying } from './now-playing/now-playing';
import { ComingSoon } from './coming-soon/coming-soon';

@Component({
  imports: [Hero, RecentlyViewed, NowPlaying, ComingSoon],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {}
