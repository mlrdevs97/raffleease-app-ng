import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ProfilesService } from '../../services/profiles.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { UserProfile, PhoneNumberFormData, UpdatePhoneNumberRequest } from '../../models/profile.model';
import { PhoneNumberData } from '../../../auth/models/auth.model';
import { ConfirmationMessages } from '../../../../core/constants/confirmation-messages';
import { SuccessMessages } from '../../../../core/constants/success-messages';
import { ClientValidationMessages } from '../../../../core/constants/client-validation-messages';

@Component({
  selector: 'app-update-phone',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, ConfirmationDialogComponent],
  templateUrl: './update-phone.component.html',
})
export class UpdatePhoneComponent implements OnInit {
  @Input() userProfile: UserProfile | null = null;
  @Input() userId: number | null = null;
  @Output() phoneUpdated = new EventEmitter<UserProfile>();

  private readonly fb = inject(FormBuilder);
  private readonly profilesService = inject(ProfilesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  phoneForm: FormGroup;
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  showConfirmDialog = signal(false);
  validationMessages = ClientValidationMessages;

  confirmDialogData: ConfirmationDialogData = ConfirmationMessages.profile.confirmPhoneUpdate;

  constructor() {
    this.phoneForm = this.fb.group({
      phoneNumber: this.fb.group({
        prefix: ['', [Validators.required, Validators.pattern(/^\+\d{1,3}$/)]],
        nationalNumber: ['', [Validators.required, Validators.pattern(/^\d{1,14}$/)]]
      })
    });
  }

  ngOnInit(): void {
    if (this.userProfile?.phoneNumber) {
      this.populateForm();
    }
  }

  private populateForm(): void {
    if (!this.userProfile?.phoneNumber) return;

    const phoneData = this.userProfile.phoneNumber;
    this.phoneForm.patchValue({
      phoneNumber: {
        prefix: phoneData.prefix || '',
        nationalNumber: phoneData.nationalNumber || ''
      }
    });
  }

  onSubmit(): void {
    if (!this.phoneForm.valid) {
      this.phoneForm.markAllAsTouched();
      return;
    }

    this.showConfirmDialog.set(true);
  }

  onConfirmUpdate(): void {
    if (!this.userId || !this.phoneForm.valid) return;

    this.isSaving.set(true);
    this.resetMessages();
    this.showConfirmDialog.set(false);

    const formData: PhoneNumberFormData = this.phoneForm.value;
    const updateRequest: UpdatePhoneNumberRequest = {
      phoneNumber: this.buildPhoneNumber(formData.phoneNumber)
    };

    this.profilesService.updatePhoneNumber(this.userId, updateRequest).subscribe({
      next: (updatedProfile) => {
        this.userProfile = updatedProfile;
        this.successMessage.set(SuccessMessages.profile.phoneUpdated);
        this.isSaving.set(false);
        setTimeout(() => this.successMessage.set(null), 5000);
        this.phoneUpdated.emit(updatedProfile);
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

  private buildPhoneNumber(phoneData: { prefix: string; nationalNumber: string }): PhoneNumberData {
    return {
      prefix: phoneData.prefix.trim(),
      nationalNumber: phoneData.nationalNumber.trim()
    };
  }

  private applyFieldErrors(errors: Record<string, string>): void {
    this.fieldErrors.set(errors);
    
    Object.keys(errors).forEach(fieldPath => {
      const control = this.phoneForm.get(fieldPath);
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
    const control = this.phoneForm.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return null;
    }

    // Look for server-specific error first
    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    // Return client-side validation error using centralized messages
    if (control.errors['required']) {
      return this.validationMessages.common.required;
    } else if (control.errors['pattern']) {
      if (fieldName.includes('prefix')) {
        return this.validationMessages.phone.countryCodePattern;
      } else if (fieldName.includes('nationalNumber')) {
        return this.validationMessages.phone.nationalNumberPattern;
      }
      return this.validationMessages.common.pattern;
    }

    return null;
  }
}
