import { Component } from '@angular/core';
import { Sorter } from './components/sorter/sorter';

@Component({
  imports: [Sorter],
  selector: 'app-list',
  styleUrl: './list.css',
  templateUrl: './list.html',
})
export class List {}
