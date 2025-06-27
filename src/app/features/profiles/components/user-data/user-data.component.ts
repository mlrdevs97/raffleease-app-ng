import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { NameFormatterDirective } from '../../../../shared/directives/name-formatter.directive';
import { ProfilesService } from '../../services/profiles.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { UserProfile, UserProfileFormData, UpdateUserProfileRequest } from '../../models/profile.model';
import { ConfirmationMessages } from '../../../../core/constants/confirmation-messages';
import { ClientValidationMessages } from '../../../../core/constants/client-validation-messages';
import { formatName } from '../../../../core/utils/text-format.utils';

@Component({
  selector: 'app-user-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, ConfirmationDialogComponent, NameFormatterDirective],
  templateUrl: './user-data.component.html',
})
export class UserDataComponent implements OnInit {
  @Input() userProfile: UserProfile | null = null;
  @Input() userId: number | null = null;
  @Output() profileUpdated = new EventEmitter<UserProfile>();

  private readonly fb = inject(FormBuilder);
  private readonly profilesService = inject(ProfilesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  userForm: FormGroup;
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  showConfirmDialog = signal(false);
  validationMessages = ClientValidationMessages;

  confirmDialogData: ConfirmationDialogData = ConfirmationMessages.profile.confirmProfileUpdate;

  constructor() {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      userName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]]
    });
  }

  ngOnInit(): void {
    if (this.userProfile) {
      this.populateForm();
    } else if (this.userId) {
      this.loadUserProfile();
    }
  }

  private loadUserProfile(): void {
    if (!this.userId) return;

    this.isLoading.set(true);
    this.resetMessages();

    this.profilesService.getUserProfile(this.userId).subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.populateForm();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(): void {
    if (!this.userProfile) return;
    
    this.userForm.patchValue({
      firstName: formatName(this.userProfile.firstName),
      lastName: formatName(this.userProfile.lastName),
      userName: this.userProfile.userName
    });
  }

  onSubmit(): void {
    if (!this.userForm.valid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.showConfirmDialog.set(true);
  }

  onConfirmUpdate(): void {
    if (!this.userId || !this.userForm.valid) return;

    this.isSaving.set(true);
    this.resetMessages();
    this.showConfirmDialog.set(false);

    const formData: UserProfileFormData = this.userForm.value;
    const updateRequest: UpdateUserProfileRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      userName: formData.userName
    };

    this.profilesService.updateUserProfile(this.userId, updateRequest).subscribe({
      next: (updatedProfile) => {
        this.userProfile = updatedProfile;
        this.successMessage.set('Profile updated successfully');
        this.isSaving.set(false);
        // Auto-hide success message after 5 seconds
        setTimeout(() => this.successMessage.set(null), 5000);
        this.profileUpdated.emit(updatedProfile);
      },
      error: (error) => {
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        if (this.errorHandler.isValidationError(error)) {
          const validationErrors = this.errorHandler.getValidationErrors(error);
          this.applyFieldErrors(validationErrors);
        }
        this.isSaving.set(false);
      }
    });
  }

  onCancelUpdate(): void {
    this.showConfirmDialog.set(false);
  }

  private applyFieldErrors(errors: Record<string, string>): void {
    this.fieldErrors.set(errors);
    
    Object.keys(errors).forEach(fieldPath => {
      // Handle nested userData paths from server
      const actualFieldPath = fieldPath.startsWith('userData.') 
        ? fieldPath.replace('userData.', '') 
        : fieldPath;
      
      const control = this.userForm.get(actualFieldPath);
      if (control) {
        control.markAsTouched();
        control.setErrors({ serverError: errors[fieldPath] });
      }
    });
  }

  private resetMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.fieldErrors.set({});
  }

  getFieldErrorMessage(fieldName: string): string | null {
    const control = this.userForm.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    if (control.errors['required']) {
      return this.validationMessages.common.required;
    } else if (control.errors['minlength']) {
      return this.validationMessages.common.minlength(control.errors['minlength'].requiredLength);
    } else if (control.errors['maxlength']) {
      return this.validationMessages.common.maxlength(control.errors['maxlength'].requiredLength);
    }

    return null;
  }
}
