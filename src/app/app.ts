import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './features/header/header';
import { ModalService } from './core/services/modal.service';
import { LogIn } from './features/auth/log-in/log-in';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, LogIn],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly modalService = inject(ModalService);
  @HostListener('document:keydown.escape')
  async onEscape() {
    this.modalService.closeAll();
  }
}
