import { Component } from '@angular/core';
import { RaffleDetailsComponent } from '../raffle-details/raffle-details.component';
import { RaffleTicketsComponent } from '../raffle-tickets/raffle-tickets.component';
import { RaffleImagesUploadComponent } from '../raffle-images-upload/raffle-images-upload.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { RaffleService } from '../../../services/raffle.service';
import { RaffleCreate } from '../../../models/raffle-create.model';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-raffle-form',
  standalone: true,
  imports: [ReactiveFormsModule, RaffleDetailsComponent, RaffleTicketsComponent, RaffleImagesUploadComponent],
  templateUrl: './raffle-form.component.html'
})
export class RaffleFormComponent {
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  raffleForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private raffleService: RaffleService, 
    private errorHandler: ErrorHandlerService,
    private authService: AuthService
  ) {
    this.raffleForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(5000)]],
      endDate: ['', [Validators.required]],
      images: this.fb.control([], [Validators.required]),
      ticketsInfo: this.fb.group({
        amount: ['', [Validators.required, Validators.min(1)]],
        price: ['', [Validators.required, Validators.min(0.01)]],
        lowerLimit: ['', [Validators.required, Validators.min(0)]]
      })
    });
  }

  applyFieldErrors(errors: Record<string, string>): void {
    Object.keys(errors).forEach(fieldPath => {
      const control = this.raffleForm.get(fieldPath);
      if (control) {
        control.markAsTouched();
        control.setErrors({ serverError: errors[fieldPath] });
      }
    });
  }

  onSubmit(): void {
    if (!this.raffleForm.valid) {
      this.raffleForm.markAllAsTouched();
      return;
    }

    const rawFormValue = this.raffleForm.value;
    const raffleData: RaffleCreate = {
      ...rawFormValue,
      endDate: `${rawFormValue.endDate}T00:00:00`
    };

    const associationId = this.authService.getAssociationId();
    if (!associationId) {
      this.authService.logout();
      return;
    }
    this.isLoading.set(true);
    this.resetErrors();
    this.raffleService.createRaffle(associationId, raffleData).subscribe({
      next: (response) => {
        console.log('Raffle created successfully', response);
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        if (this.errorHandler.isValidationError(error)) {
          const validationErrors = this.errorHandler.getValidationErrors(error);
          this.fieldErrors.set(validationErrors);
          this.applyFieldErrors(validationErrors);
        }
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  resetErrors(): void {
    this.errorMessage.set(null);
    this.fieldErrors.set({});
  }

  get ticketsInfoFormGroup(): FormGroup {
    return this.raffleForm.get('ticketsInfo') as FormGroup;
  }

  get imagesControl(): FormControl {
    return this.raffleForm.get('images') as FormControl;
  }  
} 