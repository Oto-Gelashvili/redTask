import { Component, inject } from '@angular/core';
import { ModalService } from '../../core/services/modal.service';

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  protected readonly modalService = inject(ModalService);
}
