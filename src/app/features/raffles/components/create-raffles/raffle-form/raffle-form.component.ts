import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { RaffleDetailsComponent } from '../raffle-details/raffle-details.component';
import { RaffleTicketsComponent } from '../raffle-tickets/raffle-tickets.component';
import { RaffleImagesUploadComponent } from '../raffle-images-upload/raffle-images-upload.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { RaffleService } from '../../../services/raffle.service';
import { RaffleQueryService } from '../../../services/raffle-query.service';
import { RaffleImagesUploadService } from '../../../services/raffle-images-upload.service';
import { RaffleCreate } from '../../../models/raffle-create.model';
import { RaffleEdit } from '../../../models/raffle-edit.model';
import { Image } from '../../../models/image.model';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
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
  private uploadedImageIds: number[] = [];

  constructor(
    private fb: FormBuilder, 
    private raffleService: RaffleService,
    private raffleQueryService: RaffleQueryService,
    private raffleImagesUploadService: RaffleImagesUploadService,
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
      startDate: [''],
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

    const startDate = this.raffleData.startDate ? new Date(this.raffleData.startDate).toISOString().split('T')[0] : '';    
    const endDate = new Date(this.raffleData.endDate).toISOString().split('T')[0];

    this.raffleForm.patchValue({
      title: this.raffleData.title,
      description: this.raffleData.description,
      startDate: startDate,
      endDate: endDate,
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
      const currentImages = this.raffleForm.get('images')?.value as Image[] || [];
      this.uploadedImageIds = currentImages.map(img => img.id);
      this.createRaffle();
    } else {
      this.editRaffle();
    }
  }

  private createRaffle(): void {
    const rawFormValue = this.raffleForm.value;
    console.log('Start Date from Form Control:', this.raffleForm.get('startDate')?.value);
    const raffleData: RaffleCreate = {
      ...rawFormValue,
      startDate: rawFormValue.startDate ? `${rawFormValue.startDate}T23:59:59` : undefined,
      endDate: `${rawFormValue.endDate}T23:59:59`
    };

    console.log('raffleData:', raffleData);

    this.raffleService.createRaffle(raffleData).subscribe({
      next: (response: SuccessResponse<Raffle>) => {
        if (response.data?.id) {
          console.log('response:', response.data);
          this.uploadedImageIds = [];
          this.raffleQueryService.clearSearchCache();
          this.raffleQueryService.updateRaffleCache(response.data.id, response.data);          
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

  /**
   * Clean up uploaded images when explicitly requested.
   */
  private cleanupUploadedImages(): void {
    if (this.mode !== 'create' || this.uploadedImageIds.length === 0) {
      return;
    }

    this.raffleImagesUploadService.deleteMultipleImages(this.uploadedImageIds).subscribe({
      next: () => {
        this.uploadedImageIds = [];
      },
      error: (error) => {
        this.uploadedImageIds = [];
      }
    });
  }

  /**
   * Explicitly cancel the raffle creation and cleanup uploaded images.
   * This can be called by a cancel button or when user navigates away.
   */
  cancelRaffleCreation(): void {
    this.cleanupUploadedImages();
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    if (this.mode === 'create') {
      this.cancelRaffleCreation();
    }
    this.router.navigate(['/raffles']);
  }

  private editRaffle(): void {
    if (!this.raffleData?.id) return;

    const rawFormValue = this.raffleForm.value;
    const raffleEditData: RaffleEdit = {
      title: rawFormValue.title,
      description: rawFormValue.description,
      endDate: `${rawFormValue.endDate}T23:59:59`,
      images: rawFormValue.images,
      ticketPrice: rawFormValue.ticketsInfo.price,
      totalTickets: rawFormValue.ticketsInfo.amount,
    };

    this.raffleService.editRaffle(this.raffleData.id, raffleEditData).subscribe({
      next: (response: SuccessResponse<Raffle>) => {
        if (response.data?.id) {
          console.log(response.data);
          // Update cache with the edited raffle data
          this.raffleQueryService.updateRaffleCache(response.data.id, response.data);
          
          this.router.navigate(['/raffles', response.data.id], {
            queryParams: { success: SuccessMessages.raffle.updated }
          });
        }
      },
      error: (error: unknown) => {
        console.log(error);
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