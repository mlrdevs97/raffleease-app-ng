import { Component, Input, Output, EventEmitter, OnChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ProfilesService } from '../../services/profiles.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { EmailFormData, UpdateEmailRequest } from '../../models/profile.model';
import { ConfirmationMessages } from '../../../../core/constants/confirmation-messages';
import { SuccessMessages } from '../../../../core/constants/success-messages';
import { ClientValidationMessages } from '../../../../core/constants/client-validation-messages';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-update-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, ConfirmationDialogComponent],
  templateUrl: './update-email.component.html',
})
export class UpdateEmailComponent implements OnChanges {
  @Input() userProfile: User | null = null;
  @Input() userId: number | null = null;
  @Input() showEmailVerificationSuccess: boolean = false;
  @Input() emailVerificationError: string | null = null;
  @Output() emailUpdateRequested = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly profilesService = inject(ProfilesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  emailForm: FormGroup;
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  showConfirmDialog = signal(false);
  validationMessages = ClientValidationMessages;

  confirmDialogData: ConfirmationDialogData = ConfirmationMessages.profile.confirmEmailUpdate;

  constructor() {
    this.emailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]]
    });
  }

  get isEmailVerificationSuccess(): boolean {
    return this.successMessage() === SuccessMessages.profile.emailUpdated;
  }

  ngOnChanges(): void {
    if (this.showEmailVerificationSuccess) {
      this.successMessage.set(SuccessMessages.profile.emailUpdated);
      this.errorMessage.set(null); // Clear any previous errors
      setTimeout(() => this.successMessage.set(null), 5000);
    } else if (this.emailVerificationError) {
      this.errorMessage.set(this.emailVerificationError);
      this.successMessage.set(null);
      setTimeout(() => this.errorMessage.set(null), 5000);
    }
  }

  onSubmit(): void {
    if (!this.emailForm.valid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.showConfirmDialog.set(true);
  }

  onConfirmUpdate(): void {
    if (!this.userId || !this.emailForm.valid) return;

    this.isSaving.set(true);
    this.resetMessages();
    this.showConfirmDialog.set(false);

    const formData: EmailFormData = this.emailForm.value;
    const updateRequest: UpdateEmailRequest = {
      newEmail: formData.newEmail
    };

    this.profilesService.updateEmail(this.userId, updateRequest).subscribe({
      next: () => {
        this.successMessage.set(SuccessMessages.profile.emailUpdateRequested);
        this.emailForm.reset();
        this.isSaving.set(false);
        setTimeout(() => this.successMessage.set(null), 10000);
        this.emailUpdateRequested.emit();
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
      const control = this.emailForm.get(fieldPath);
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
    const control = this.emailForm.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    if (control.errors['required']) {
      return this.validationMessages.common.required;
    } else if (control.errors['email']) {
      return this.validationMessages.common.email;
    }

    return null;
  }
}
