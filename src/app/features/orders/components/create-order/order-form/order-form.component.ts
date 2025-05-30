import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { TicketSelectionComponent } from '../ticket-selection/ticket-selection.component';
import { CustomerInformationComponent } from '../customer-information/customer-information.component';
import { AdditionalInformationComponent } from '../additional-information/additional-information.component';
import { RaffleSelectionComponent } from '../raffle-selection/raffle-selection.component';
import { TicketSelectionService } from '../../../services/ticket-selection.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RaffleSelectionComponent,
    TicketSelectionComponent,
    CustomerInformationComponent,
    AdditionalInformationComponent
  ],
  templateUrl: './order-form.component.html'
})
export class OrderFormComponent implements OnInit, OnDestroy {
  @Input() raffleId?: number;

  orderForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});

  selectedRaffleId = signal<number | null>(null);
  private raffleSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private ticketSelectionService: TicketSelectionService
  ) {
    this.orderForm = this.fb.group({
      raffleSelection: this.fb.group({
        raffleId: [this.raffleId || '', this.raffleId ? [] : [Validators.required]]
      }),
      ticketSelection: this.fb.group({
        ticketNumber: ['', Validators.required],
        ticketSearchType: ['specific'],
        quantity: [1, [Validators.required, Validators.min(1)]]
      }),
      customerInformation: this.fb.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: this.fb.group({
          countryCode: ['', Validators.required],
          nationalNumber: ['', Validators.required]
        })
      }),
      additionalInformation: this.fb.group({
        comment: ['', Validators.maxLength(500)]
      })
    });
  }

  ngOnInit(): void {
    if (this.raffleId) {
      this.selectedRaffleId.set(this.raffleId);
    }
    
    this.raffleSubscription = this.raffleSelectionGroup.get('raffleId')?.valueChanges.subscribe(raffleId => {
      const newRaffleId = raffleId ? Number(raffleId) : null;
      const previousRaffleId = this.selectedRaffleId();
      
      this.selectedRaffleId.set(newRaffleId);
      
      // Clear selected tickets when raffle is deselected or changed
      if (!newRaffleId || (previousRaffleId && previousRaffleId !== newRaffleId)) {
        this.ticketSelectionService.clearTickets();
        // Reset ticket selection form fields
        this.ticketSelectionGroup.get('ticketNumber')?.setValue('');
        this.ticketSelectionGroup.get('quantity')?.setValue(1);
      }
    });
  }

  ngOnDestroy(): void {
    this.raffleSubscription?.unsubscribe();
  }

  applyFieldErrors(errors: Record<string, string>): void {
    Object.keys(errors).forEach(fieldPath => {
      const control = this.orderForm.get(fieldPath);
      if (control) {
        control.markAsTouched();
        control.setErrors({ serverError: errors[fieldPath] });
      }
    });
  }

  resetErrors(): void {
    this.errorMessage.set(null);
    this.fieldErrors.set({});
  }

  get raffleSelectionGroup(): FormGroup {
    return this.orderForm.get('raffleSelection') as FormGroup;
  }

  get ticketSelectionGroup(): FormGroup {
    return this.orderForm.get('ticketSelection') as FormGroup;
  }

  get customerInformationGroup(): FormGroup {
    return this.orderForm.get('customerInformation') as FormGroup;
  }

  get additionalInformationGroup(): FormGroup {
    return this.orderForm.get('additionalInformation') as FormGroup;
  }

  get isRaffleSelectionRequired(): boolean {
    return !this.raffleId;
  }

  get hasSelectedTickets(): boolean {
    return this.ticketSelectionService.getSelectedTickets()().length > 0;
  }

  get selectedTicketCount(): number {
    return this.ticketSelectionService.getSelectedTickets()().length;
  }
}