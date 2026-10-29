import { Component, inject } from '@angular/core';
import { SearchBar } from '../search-bar/search-bar';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-search-modal',
  imports: [SearchBar],
  templateUrl: './search-modal.html',
  styleUrl: './search-modal.css',
  host: { '(document:keydown.escape)': 'close()' },
})
export class SearchModal {
  private readonly modalService = inject(ModalService);

  protected close() {
    this.modalService.closeSearch();
  }
}
