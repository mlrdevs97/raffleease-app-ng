import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { RaffleDetailsComponent } from '../raffle-details/raffle-details.component';
import { RaffleTicketsComponent } from '../raffle-tickets/raffle-tickets.component';
import { RaffleImagesUploadComponent } from '../raffle-images-upload/raffle-images-upload.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { RaffleService } from '../../../services/raffle.service';
import { RaffleCreate } from '../../../models/raffle-create.model';
import { RaffleEdit } from '../../../models/raffle-edit.model';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { SuccessResponse } from '../../../../../core/models/api-response.model';
import { Raffle } from '../../../models/raffle.model';
import { SuccessMessages } from '../../../../../core/constants/success-messages';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-raffle-form',
  standalone: true,
  imports: [ReactiveFormsModule, RaffleDetailsComponent, RaffleTicketsComponent, RaffleImagesUploadComponent, ButtonComponent],
  templateUrl: './raffle-form.component.html'
})
export class RaffleFormComponent implements OnInit, OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() raffleData?: Raffle;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  raffleForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private raffleService: RaffleService, 
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {
    this.raffleForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.raffleData) {
      this.prefillForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['raffleData'] && this.raffleData && this.mode === 'edit') {
      this.prefillForm();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
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

  private prefillForm(): void {
    if (!this.raffleData) return;

    // Format end date for input[type="date"] (YYYY-MM-DD)
    const endDate = new Date(this.raffleData.endDate).toISOString().split('T')[0];

    this.raffleForm.patchValue({
      title: this.raffleData.title,
      description: this.raffleData.description,
      endDate: endDate,
      // Don't set images here as they are handled by the upload component via initialImages
      ticketsInfo: {
        amount: this.raffleData.totalTickets,
        price: this.raffleData.ticketPrice,
        lowerLimit: this.raffleData.firstTicketNumber
      }
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

    this.isLoading.set(true);
    this.resetErrors();

    if (this.mode === 'create') {
      this.createRaffle();
    } else {
      this.editRaffle();
    }
  }

  private createRaffle(): void {
    const rawFormValue = this.raffleForm.value;
    const raffleData: RaffleCreate = {
      ...rawFormValue,
      endDate: `${rawFormValue.endDate}T00:00:00`
    };

    this.raffleService.createRaffle(raffleData).subscribe({
      next: (response: SuccessResponse<Raffle>) => {
        if (response.data?.id) {
          this.router.navigate(['/raffles', response.data.id], {
            queryParams: { success: SuccessMessages.raffle.created }
          });
        }
      },
      error: (error: unknown) => {
        this.handleError(error);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private editRaffle(): void {
    if (!this.raffleData?.id) return;

    const rawFormValue = this.raffleForm.value;
    const raffleEditData: RaffleEdit = {
      title: rawFormValue.title,
      description: rawFormValue.description,
      endDate: `${rawFormValue.endDate}T00:00:00`,
      images: rawFormValue.images,
      ticketPrice: rawFormValue.ticketsInfo.price,
      totalTickets: rawFormValue.ticketsInfo.amount,
      price: rawFormValue.ticketsInfo.price
    };

    this.raffleService.editRaffle(this.raffleData.id, raffleEditData).subscribe({
      next: (response: SuccessResponse<Raffle>) => {
        console.log(SuccessMessages.raffle.updated, response);
        if (response.data?.id) {
          this.router.navigate(['/raffles', response.data.id], {
            queryParams: { success: SuccessMessages.raffle.updated }
          });
        }
      },
      error: (error: unknown) => {
        this.handleError(error);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private handleError(error: unknown): void {
    this.errorMessage.set(this.errorHandler.getErrorMessage(error));
    if (this.errorHandler.isValidationError(error)) {
      const validationErrors = this.errorHandler.getValidationErrors(error);
      this.fieldErrors.set(validationErrors);
      this.applyFieldErrors(validationErrors);
    }
    this.isLoading.set(false);
  }

  resetErrors(): void {
    this.errorMessage.set(null);
    this.fieldErrors.set({});
  }

  get buttonText(): string {
    return this.mode === 'create' ? 'Create Raffle' : 'Update Raffle';
  }

  get loadingText(): string {
    return this.mode === 'create' ? 'Creating...' : 'Updating...';
  }

  get ticketsInfoFormGroup(): FormGroup {
    return this.raffleForm.get('ticketsInfo') as FormGroup;
  }

  get imagesControl(): FormControl {
    return this.raffleForm.get('images') as FormControl;
  }  
} 