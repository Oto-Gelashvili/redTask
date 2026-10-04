import { Component, inject } from '@angular/core';
import { ModalService } from '../../core/services/modal.service';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  protected readonly modalService = inject(ModalService);
}
