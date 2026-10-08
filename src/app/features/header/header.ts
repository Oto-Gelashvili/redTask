import { Component, inject } from '@angular/core';
import { ModalService } from '../../core/services/modal.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileMenu } from './components/profile-menu/profile-menu';
import { SearchBar } from './components/search-bar/search-bar';

@Component({
  imports: [RouterLink, ProfileMenu, SearchBar],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  protected readonly modalService = inject(ModalService);
  protected readonly authService = inject(AuthService);
}
