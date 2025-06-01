import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';
import { OrderDetailHeaderComponent } from '../../components/order-details/order-detail-header/order-detail-header.component';
import { OrderSummaryComponent } from '../../components/order-details/order-summary/order-summary.component';
import { OrderCommentComponent } from '../../components/order-details/order-comment/order-comment.component';
import { TicketsPreviewComponent, TicketsPreviewConfig } from '../../components/create-order/tickets-preview/tickets-preview.component';
import { OrderConfirmationDialogComponent, OrderConfirmationData, OrderConfirmationResult } from '../../../../shared/components/order-confirmation-dialog/order-confirmation-dialog.component';
import { Order, OrderItem, OrderStatus } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { OrderTicket, TicketStatus } from '../../../../core/models/ticket.model';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ErrorMessages } from '../../../../core/constants/error-messages';
import { SuccessMessages } from '../../../../core/constants/success-messages';
import { ClientValidationMessages } from '../../../../core/constants/client-validation-messages';
import { SuccessResponse } from '../../../../core/models/api-response.model';
import { ConfirmationMessages } from '../../../../core/constants/confirmation-messages';

@Component({
  selector: 'app-order-details-page',
  standalone: true,
  imports: [
    CommonModule,
    BackLinkComponent,
    OrderDetailHeaderComponent,
    OrderSummaryComponent,
    OrderCommentComponent,
    TicketsPreviewComponent,
    OrderConfirmationDialogComponent
  ],
  templateUrl: './order-details-page.component.html'
})
export class OrderDetailsPageComponent implements OnInit {
  readonly order = signal<Order | null>(null);
  readonly isLoading = signal(false);
  readonly isUpdatingOrder = signal(false);
  readonly showConfirmationDialog = signal(false);
  readonly currentAction = signal<'complete' | 'cancel' | 'setUnpaid' | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Enum reference for template usage
  readonly OrderStatus = OrderStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: OrdersService,
    private errorHandler: ErrorHandlerService
  ) {}
  
  readonly ticketsConfig: TicketsPreviewConfig = {
    mode: 'readonly',
    title: 'Order Tickets',
    showActions: false,
    showStatus: true
  };

  get orderTickets(): OrderTicket[] {
    const currentOrder = this.order();
    if (!currentOrder?.orderItems) return [];
    
    const ticketStatus = this.getTicketStatusFromOrderStatus(currentOrder.status);
    
    return currentOrder.orderItems.map((item: OrderItem) => ({
      id: item.id,
      ticketNumber: item.ticketNumber,
      status: ticketStatus,
      raffleId: item.raffleId,
      customerId: item.customerId, 
      createdAt: currentOrder.createdAt,
      updatedAt: currentOrder.updatedAt,
      price: item.priceAtPurchase
    }));
  }

  get confirmationDialogData(): OrderConfirmationData {
    const action = this.currentAction();
    if (action === 'complete') {
      return {
        ...ConfirmationMessages.order.confirmCompletion,
        requiresPaymentMethod: true
      };
    } else if (action === 'cancel') {
      return {
        ...ConfirmationMessages.order.confirmCancellation,
        variant: 'destructive'
      };
    } else if (action === 'setUnpaid') {
      return {
        ...ConfirmationMessages.order.confirmSetUnpaid
      };
    }
    return ConfirmationMessages.order.confirmCompletion;
  }

  /**
   * Maps order status to appropriate ticket status
   */
  private getTicketStatusFromOrderStatus(orderStatus: OrderStatus): TicketStatus {
    switch (orderStatus) {
      case OrderStatus.COMPLETED:
        return TicketStatus.SOLD;
      case OrderStatus.PENDING:
        return TicketStatus.RESERVED;
      case OrderStatus.CANCELLED:
      case OrderStatus.UNPAID:
      case OrderStatus.REFUNDED:
      default:
        return TicketStatus.AVAILABLE;
    }
  }

  ngOnInit(): void {
    this.loadOrderDetails();
  }

  onCompleteOrderClicked(): void {
    this.currentAction.set('complete');
    this.showConfirmationDialog.set(true);
    this.resetMessages();
  }

  onCancelOrderClicked(): void {
    this.currentAction.set('cancel');
    this.showConfirmationDialog.set(true);
    this.resetMessages();
  }

  onSetUnpaidRequested(): void {
    this.currentAction.set('setUnpaid');
    this.showConfirmationDialog.set(true);
    this.resetMessages();
  }

  onConfirmationConfirmed(result: OrderConfirmationResult): void {
    const action = this.currentAction();
    const currentOrder = this.order();
    
    if (!action || !currentOrder) return;

    this.isUpdatingOrder.set(true);
    this.showConfirmationDialog.set(false);
    this.resetMessages();

    if (action === 'complete') {
      if (!result.paymentMethod) {
        this.errorMessage.set('Payment method is required');
        this.isUpdatingOrder.set(false);
        return;
      }

      this.ordersService.completeOrder(currentOrder.id, { paymentMethod: result.paymentMethod }).subscribe({
        next: (updatedOrder: Order) => {
          this.successMessage.set(SuccessMessages.order.completed);
          this.order.set(updatedOrder);
          this.isUpdatingOrder.set(false);
          this.currentAction.set(null);
          
          // Clear success message after 5 seconds
          setTimeout(() => this.successMessage.set(null), 5000);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.errorHandler.getErrorMessage(error));
          this.isUpdatingOrder.set(false);
          this.currentAction.set(null);
          
          // Clear error message after 8 seconds
          setTimeout(() => this.errorMessage.set(null), 8000);
        }
      });
    } else if (action === 'cancel') {
      this.ordersService.cancelOrder(currentOrder.id).subscribe({
        next: (updatedOrder: Order) => {
          this.successMessage.set(SuccessMessages.order.cancelled);
          this.order.set(updatedOrder);
          this.isUpdatingOrder.set(false);
          this.currentAction.set(null);
          
          setTimeout(() => this.successMessage.set(null), 5000);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.errorHandler.getErrorMessage(error));
          this.isUpdatingOrder.set(false);
          this.currentAction.set(null);
          
          setTimeout(() => this.errorMessage.set(null), 8000);
        }
      });
    } else if (action === 'setUnpaid') {
      this.ordersService.setOrderUnpaid(currentOrder.id).subscribe({
        next: (updatedOrder: Order) => {
          this.successMessage.set(SuccessMessages.order.setUnpaid);
          this.order.set(updatedOrder);
          this.isUpdatingOrder.set(false);
          this.currentAction.set(null);
          
          setTimeout(() => this.successMessage.set(null), 5000);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.errorHandler.getErrorMessage(error));
          this.isUpdatingOrder.set(false);
          this.currentAction.set(null);
          
          setTimeout(() => this.errorMessage.set(null), 8000);
        }
      });
    }
  }

  onConfirmationCancelled(): void {
    this.showConfirmationDialog.set(false);
    this.currentAction.set(null);
    this.resetMessages();
  }

  onOrderUpdated(updatedOrder: Order): void {
    this.order.set(updatedOrder);
    this.resetMessages();
  }

  private resetMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private loadOrderDetails(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    
    if (!orderId || isNaN(Number(orderId))) {
      this.router.navigate(['/orders'], { 
        queryParams: { error: ErrorMessages.dedicated['order']['NOT_FOUND'] } 
      });
      return;
    }

    this.isLoading.set(true);

    this.ordersService.getOrder(Number(orderId)).subscribe({
      next: (order) => {
        if (order) {
          this.order.set(order);
        }
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        this.isLoading.set(false);
        this.router.navigate(['/orders'], { 
          queryParams: { error: this.errorHandler.getErrorMessage(error) } 
        });
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  goBackToOrders(): void {
    this.router.navigate(['/orders']);
  }
} 