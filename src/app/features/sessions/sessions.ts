import { Component } from '@angular/core';
import { Filter } from './components/filter/filter';
import { List } from './components/list/list';

@Component({
  imports: [Filter, List],
  selector: 'app-sessions',
  styleUrl: './sessions.css',
  templateUrl: './sessions.html',
})
export class Sessions {}
