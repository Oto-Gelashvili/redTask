import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { User } from '../../models/user';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly authService = inject(AuthService);
  private readonly notyService = inject(NotificationService);
  private readonly api = inject(ApiService);

  async updateProfile(data: {
    fullName: string;
    mobile: string;
    birthDate: string;
    prefferedVenue: string;
  }) {
    const res = await this.api.request<{ data: User }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.authService.updateUser(res.data);
    this.notyService.showSuccess('Profile updated');
    return res.data;
  }
}
