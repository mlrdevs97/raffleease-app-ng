import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { AuthService } from '../../auth/services/auth.service';
import { 
  UpdateUserProfileRequest, 
  UpdateEmailRequest, 
  UpdatePhoneNumberRequest, 
  UpdatePasswordRequest,
  VerifyEmailUpdateRequest
} from '../models/profile.model';
import { User } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfilesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  updateCurrentUserProfile(userData: UpdateUserProfileRequest): Observable<User> {
    const userId = this.authService.requireUserId();
    return this.updateUserProfile(userId, userData);
  }

  updateUserProfile(userId: number, userData: UpdateUserProfileRequest): Observable<User> {
    const associationId = this.authService.requireAssociationId();
    return this.http.put<SuccessResponse<User>>(
      `${this.apiUrl}/associations/${associationId}/users/${userId}`,
      { userData }
    ).pipe(
      map(response => response.data!)
    );
  }

  updateCurrentUserEmail(emailData: UpdateEmailRequest): Observable<void> {
    const userId = this.authService.requireUserId();
    return this.updateEmail(userId, emailData);
  }

  updateEmail(userId: number, emailData: UpdateEmailRequest): Observable<void> {
    const associationId = this.authService.requireAssociationId();
    return this.http.post<SuccessResponse<void>>(
      `${this.apiUrl}/associations/${associationId}/users/${userId}/email/verification-request`,
      emailData
    ).pipe(
      map(() => void 0)
    );
  }

  verifyEmailUpdate(verificationData: VerifyEmailUpdateRequest): Observable<void> {
    const associationId = this.authService.requireAssociationId();
    return this.http.post<SuccessResponse<void>>(
      `${this.apiUrl}/associations/${associationId}/users/verify-email-update`,
      verificationData
    ).pipe(
      map(() => void 0)
    );
  }

  updateCurrentUserPhoneNumber(phoneData: UpdatePhoneNumberRequest): Observable<User> {
    const userId = this.authService.requireUserId();
    return this.updatePhoneNumber(userId, phoneData);
  }

  updatePhoneNumber(userId: number, phoneData: UpdatePhoneNumberRequest): Observable<User> {
    const associationId = this.authService.requireAssociationId();
    return this.http.patch<SuccessResponse<User>>(
      `${this.apiUrl}/associations/${associationId}/users/${userId}/phone-number`,
      phoneData
    ).pipe(
      map(response => response.data!)
    );
  }

  updateCurrentUserPassword(passwordData: UpdatePasswordRequest): Observable<void> {
    const userId = this.authService.requireUserId();
    return this.updatePassword(userId, passwordData);
  }

  updatePassword(userId: number, passwordData: UpdatePasswordRequest): Observable<void> {
    const associationId = this.authService.requireAssociationId();
    return this.http.patch<SuccessResponse<void>>(
      `${this.apiUrl}/associations/${associationId}/users/${userId}/password`,
      passwordData
    ).pipe(
      map(() => void 0)
    );
  }
} 