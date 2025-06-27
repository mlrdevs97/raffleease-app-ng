import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserProfileComponent } from '../../components/user-profile/user-profile.component';
import { ProfilesService } from '../../services/profiles.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { UserProfile } from '../../models/profile.model';

@Component({
  selector: 'app-profile-page',
  standalone: true, 
  imports: [CommonModule, UserProfileComponent],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly profilesService = inject(ProfilesService);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandlerService);

  userProfile = signal<UserProfile | null>(null);
  userId = signal<number | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  emailVerificationSuccess = signal(false);
  emailVerificationError = signal<string | null>(null);
  
  ngOnInit(): void {
    this.loadCurrentUserProfile();
    this.checkForEmailVerificationResult();
  }

  private checkForEmailVerificationResult(): void {
    this.route.queryParams.subscribe(params => {
      if (params['emailUpdated'] === 'success') {
        this.emailVerificationSuccess.set(true);
        this.loadCurrentUserProfile();
        setTimeout(() => this.emailVerificationSuccess.set(false), 6000);
      } else if (params['emailUpdated'] === 'error') {
        const errorMessage = params['errorMessage'] || 'Email verification failed';
        this.emailVerificationError.set(errorMessage);
        setTimeout(() => this.emailVerificationError.set(null), 6000);
      }
    });
  }

  private loadCurrentUserProfile(): void {
      const currentUserId = this.authService.requireUserId();
      this.userId.set(currentUserId);
      this.isLoading.set(true);
      this.errorMessage.set(null);

      this.profilesService.getCurrentUserProfile().subscribe({
        next: (profile) => {
          this.userProfile.set(profile);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(this.errorHandler.getErrorMessage(error));
          this.isLoading.set(false);
        }
      });
  }

  onProfileUpdated(updatedProfile: UserProfile): void {
    this.userProfile.set(updatedProfile);
  }

  onPhoneUpdated(updatedProfile: UserProfile): void {
    this.userProfile.set(updatedProfile);
  }
} 