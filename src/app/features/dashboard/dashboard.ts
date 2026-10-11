import { Component } from '@angular/core';
import { Hero } from './hero/hero';
import { RecentlyViewed } from './recently-viewed/recently-viewed';

@Component({
  imports: [Hero, RecentlyViewed],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {}
