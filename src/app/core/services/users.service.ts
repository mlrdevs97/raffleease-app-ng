import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SuccessResponse } from '../models/api-response.model';
import { AuthService } from '../../features/auth/services/auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  getCurrentUserProfile(): Observable<User> {
    const userId = this.authService.requireUserId();
    return this.getUserProfile(userId);
  }

  getUserProfile(userId: number): Observable<User> {
    const associationId = this.authService.requireAssociationId();
    return this.http.get<SuccessResponse<User>>(
      `${this.apiUrl}/associations/${associationId}/users/${userId}`
    ).pipe(
      map(response => response.data!)
    );
  }
} 