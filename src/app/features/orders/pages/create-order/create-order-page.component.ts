import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderFormComponent } from '../../components/create-order/order-form/order-form.component';
import { BackLinkComponent } from '../../../../layout/components/back-link/back-link.component';
import { CartService } from '../../services/cart.service';
import { TicketSelectionService } from '../../services/ticket-selection.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { Cart } from '../../../../core/models/cart.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-order-page',
  standalone: true,
  imports: [OrderFormComponent, BackLinkComponent, CommonModule],
  templateUrl: './create-order-page.component.html'
})
export class CreateOrderPageComponent implements OnInit, OnDestroy {
  raffleId = signal<number | undefined>(undefined);
  cartError = signal<string | null>(null);
  
  constructor(
    private route: ActivatedRoute,
    public cartService: CartService,
    private ticketSelectionService: TicketSelectionService,
    private errorHandler: ErrorHandlerService
  ) {}
  
  ngOnInit(): void {
    // Parse raffle ID from query parameters
    this.route.queryParams.subscribe(params => {
      if (params['raffle']) {
        const raffleIdFromQuery = parseInt(params['raffle'], 10);
        if (!isNaN(raffleIdFromQuery)) {
          this.raffleId.set(raffleIdFromQuery);
        }
      }
    });

    // Create cart when page loads
    this.createCart();
  }

  ngOnDestroy(): void {
    this.ticketSelectionService.clearTickets();
  }

  /**
   * Retry cart creation after an error
   */
  retryCartCreation(): void {
    this.cartError.set(null);
    this.createCart();
  }

  /**
   * Create a new cart for this order session
   * Reason: Each order creation process requires a dedicated cart to hold temporary ticket reservations
   */
  private createCart(): void {
    this.cartService.createCart().subscribe({
      next: (cart: Cart) => {
        console.log('Cart created successfully:', cart);
        this.cartError.set(null);
      },
      error: (error) => {
        this.cartService.resetCreatingState();
        const errorMessage = this.errorHandler.getErrorMessage(error);
        this.cartError.set(errorMessage);
      }
    });
  }

  /**
   * Get the current cart error state
   */
  getCartError() {
    return this.cartError.asReadonly();
  }
}