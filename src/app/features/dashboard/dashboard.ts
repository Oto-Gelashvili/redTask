import { Component } from '@angular/core';
import { Hero } from './hero/hero';

@Component({
  imports: [Hero],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {}
