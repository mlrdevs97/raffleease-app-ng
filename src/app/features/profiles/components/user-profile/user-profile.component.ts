import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDataComponent } from '../user-data/user-data.component';
import { UpdateEmailComponent } from '../update-email/update-email.component';
import { UpdatePhoneComponent } from '../update-phone/update-phone.component';
import { PasswordResetComponent } from '../password-reset/password-reset.component';
import { UserProfile } from '../../models/profile.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, UserDataComponent, UpdateEmailComponent, UpdatePhoneComponent, PasswordResetComponent],
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  @Input() userProfile: UserProfile | null = null;
  @Input() userId: number | null = null;
  @Input() emailVerificationSuccess: boolean = false;
  @Input() emailVerificationError: string | null = null;

  @Output() profileUpdated = new EventEmitter<UserProfile>();
  @Output() emailUpdateRequested = new EventEmitter<void>();
  @Output() phoneUpdated = new EventEmitter<UserProfile>();

  ngOnInit(): void {
    console.log('UserProfileComponent initialized', this.userProfile);
  }

  onProfileUpdated(updatedProfile: UserProfile): void {
    this.profileUpdated.emit(updatedProfile);
  }

  onEmailUpdateRequested(): void {
    this.emailUpdateRequested.emit();
  }

  onPhoneUpdated(updatedProfile: UserProfile): void {
    this.phoneUpdated.emit(updatedProfile);
  }
} 