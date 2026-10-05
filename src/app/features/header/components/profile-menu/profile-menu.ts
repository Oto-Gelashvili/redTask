import { Component, ElementRef, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-profile-menu',
  styleUrl: './profile-menu.css',
  templateUrl: './profile-menu.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'isOpen.set(false)',
  },
})
export class ProfileMenu {
  private readonly authService = inject(AuthService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly user = this.authService.user;
  protected readonly isOpen = signal(false);

  protected toggle() {
    this.isOpen.update((v) => !v);
  }

  protected logOut() {
    this.isOpen.set(false);
    this.authService.logout();
  }

  protected onDocumentClick(event: MouseEvent) {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }
}
