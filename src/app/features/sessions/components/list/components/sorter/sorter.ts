import { Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';
import { FilterOptionsService } from '../../../../../../core/services/filter-options.service';

@Component({
  selector: 'app-sorter',
  templateUrl: './sorter.html',
  styleUrl: './sorter.css',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'isOpen.set(false)',
  },
})
export class Sorter {
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly filterOptions = inject(FilterOptionsService);

  readonly sortValue = input.required<string>();
  readonly sortChange = output<string>();

  protected readonly isOpen = signal(false);

  protected readonly selectedLabel = computed(
    () => this.filterOptions.sorts().find((s) => s.id === this.sortValue())?.label ?? '',
  );

  protected select(id: string) {
    this.isOpen.set(false);
    if (id !== this.sortValue()) this.sortChange.emit(id);
  }

  protected onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target as Node)) this.isOpen.set(false);
  }
}
