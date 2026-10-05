import { Component, inject } from '@angular/core';
import { ModalService } from '../../core/services/modal.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileMenu } from './components/profile-menu/profile-menu';

@Component({
  imports: [RouterLink, ProfileMenu],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  protected readonly modalService = inject(ModalService);
  protected readonly authService = inject(AuthService);
}
