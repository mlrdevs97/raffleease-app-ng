import { Component, Input, OnInit, OnDestroy, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { TicketSelectionComponent } from '../ticket-selection/ticket-selection.component';
import { CustomerInformationComponent } from '../customer-information/customer-information.component';
import { AdditionalInformationComponent } from '../additional-information/additional-information.component';
import { RaffleSelectionComponent } from '../raffle-selection/raffle-selection.component';
import { TicketSelectionService } from '../../../services/ticket-selection.service';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { AdminOrderCreate } from '../../../models/admin-order-create.model';
import { Order } from '../../../models/order.model';
import { ErrorMessages } from '../../../../../core/constants/error-messages';
import { OrdersService } from '../../../services/orders.service';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    RaffleSelectionComponent,
    TicketSelectionComponent,
    CustomerInformationComponent,
    AdditionalInformationComponent,
    ButtonComponent
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
    private ticketSelectionService: TicketSelectionService,
    private router: Router,
    private ordersService: OrdersService,
    private cartService: CartService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService
  ) {
    effect(() => {
      this.ticketSelectionService.getSelectedTickets()();
      this.updateTicketNumberValidation();
    });
  }

  ngOnInit(): void {
    this.orderForm = this.fb.group({
      raffleSelection: this.fb.group({
        raffleId: [this.raffleId || '', this.raffleId ? [] : [Validators.required]]
      }),
      ticketSelection: this.fb.group({
        ticketNumber: ['', [Validators.required]],
        ticketSearchType: ['specific'],
        quantity: [1, [Validators.required, Validators.min(1)]]
      }),
      customerInformation: this.fb.group({
        fullName: ['', [Validators.required, Validators.maxLength(100)]],
        email: ['', [Validators.email, Validators.maxLength(100)]],
        phoneNumber: this.fb.group({
          countryCode: ['', [Validators.pattern(/^\+\d{1,3}$/)]],
          nationalNumber: ['', [Validators.pattern(/^\d{1,14}$/)]]
        })
      }),
      additionalInformation: this.fb.group({
        comment: ['', Validators.maxLength(500)]
      })
    });

    if (this.raffleId) {
      this.selectedRaffleId.set(this.raffleId);
      // Also set the form value so the raffle-selection component receives it
      this.raffleSelectionGroup.get('raffleId')?.setValue(this.raffleId);
    }
    
    this.raffleSubscription = this.raffleSelectionGroup.get('raffleId')?.valueChanges.subscribe(raffleId => {
      const newRaffleId = raffleId ? Number(raffleId) : null;
      const previousRaffleId = this.selectedRaffleId();
      
      this.selectedRaffleId.set(newRaffleId);
      
      if (!newRaffleId || (previousRaffleId && previousRaffleId !== newRaffleId)) {
        this.ticketSelectionService.clearTickets();
        this.ticketSelectionGroup.get('ticketNumber')?.setValue('');
        this.ticketSelectionGroup.get('quantity')?.setValue(1);
      }
    });

    this.updateTicketNumberValidation();
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

  get formValidationStatus(): { [key: string]: boolean } {
    return {
      raffleSelectionValid: this.raffleSelectionGroup.valid,
      ticketSelectionValid: this.ticketSelectionGroup.valid,
      customerInformationValid: this.customerInformationGroup.valid,
      additionalInformationValid: this.additionalInformationGroup.valid,
      overallFormValid: this.orderForm.valid
    };
  }

  get createOrderButtonStatus(): { 
    isFormValid: boolean;
    hasTickets: boolean;
    isNotLoading: boolean;
    canCreateOrder: boolean;
  } {
    const isFormValid = this.orderForm.valid;
    const hasTickets = this.hasSelectedTickets;
    const isNotLoading = !this.isLoading();
    
    return {
      isFormValid,
      hasTickets,
      isNotLoading,
      canCreateOrder: isFormValid && hasTickets && isNotLoading
    };
  }

  private updateTicketNumberValidation(): void {
    const ticketNumberControl = this.ticketSelectionGroup.get('ticketNumber');
    const hasSelectedTickets = this.hasSelectedTickets;
    
    if (ticketNumberControl) {
      if (hasSelectedTickets) {
        ticketNumberControl.setValidators([]);
      } else {
        ticketNumberControl.setValidators([Validators.required]);
      }
      
      ticketNumberControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  onSubmit(): void {
    if (!this.orderForm.valid || !this.hasSelectedTickets) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const rawFormValue = this.orderForm.value;
    const selectedTickets = this.ticketSelectionService.getSelectedTickets()();
    const currentCartSignal = this.cartService.getCurrentCart();
    const currentCart = currentCartSignal();

    if (!currentCart || !currentCart.id) {
      this.errorMessage.set(ErrorMessages.dedicated['order']!['CART_NOT_FOUND']!);
      return;
    }

    const orderData: AdminOrderCreate = {
      cartId: currentCart.id,
      raffleId: Number(rawFormValue.raffleSelection.raffleId),
      ticketIds: selectedTickets.map(ticket => ticket.id),
      customer: {
        fullName: rawFormValue.customerInformation.fullName,
        email: rawFormValue.customerInformation.email || null,
        phoneNumber: rawFormValue.customerInformation.phoneNumber.countryCode && 
                     rawFormValue.customerInformation.phoneNumber.nationalNumber 
          ? {
              prefix: rawFormValue.customerInformation.phoneNumber.countryCode,
              nationalNumber: rawFormValue.customerInformation.phoneNumber.nationalNumber
            } 
          : null
      },
      comment: rawFormValue.additionalInformation.comment || null
    };

    const associationId = this.authService.requireAssociationId();

    this.isLoading.set(true);
    this.resetErrors();

    this.ordersService.createOrder(orderData).subscribe({
      next: (response: Order) => {
        this.cartService.clearCart();
        this.ticketSelectionService.clearTickets();
        this.router.navigate(['/orders', response.id]);
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
}