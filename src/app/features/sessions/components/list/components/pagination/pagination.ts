import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  readonly currentPage = input.required<number>();
  readonly lastPage = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly items = computed<(number | null)[]>(() => {
    const current = this.currentPage();
    const last = this.lastPage();

    const pages = new Set<number>([1, last, current - 1, current, current + 1]);
    if (current <= 3) [1, 2, 3].forEach((p) => pages.add(p));
    if (current >= last - 2) [last - 2, last - 1, last].forEach((p) => pages.add(p));

    const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);

    const result: (number | null)[] = [];
    sorted.forEach((p, i) => {
      const prev = sorted[i - 1];
      if (prev !== undefined) {
        if (p - prev === 2) result.push(prev + 1);
        else if (p - prev > 2) result.push(null);
      }
      result.push(p);
    });
    return result;
  });

  protected go(page: number) {
    if (page < 1 || page > this.lastPage() || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }
}
