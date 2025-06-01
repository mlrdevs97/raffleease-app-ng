import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderFormComponent } from '../../components/create-order/order-form/order-form.component';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';
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
  errorMessage = signal<string | null>(null);
  
  constructor(
    private route: ActivatedRoute,
    public cartService: CartService,
    private ticketSelectionService: TicketSelectionService,
    private errorHandler: ErrorHandlerService
  ) {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['raffle']) {
        const raffleId = parseInt(params['raffle'], 10);
        if (!isNaN(raffleId)) {
          this.raffleId.set(raffleId);
        }
      }
    });

    this.createCart();
  }

  ngOnDestroy(): void {
    this.ticketSelectionService.clearTickets();
  }

  private createCart(): void {
    this.cartService.createCart().subscribe({
      next: (cart: Cart) => {
        this.errorMessage.set(null);
      },
      error: (error) => {
        this.cartService.resetCreatingState();
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
      }
    });
  }
}