import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '../config';
import { ApiError } from '../../models/api-error';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly authService = inject(AuthService);
  private readonly notyService = inject(NotificationService);

  async updateProfile(profileData: {
    fullName: string;
    mobile: string;
    birthDate: string;
    prefferedVenue: string;
  }) {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    const json = await res.json();
    if (!res.ok) {
      const error: ApiError = {
        status: res.status,
        message: json.message ?? 'Something went wrong.',
        errors: json.errors,
      };

      throw error;
    }
    this.authService.setSession(json.data.user, json.data.token);
    this.notyService.showSuccess('Profile updated');

    return json.data;
  }
}
