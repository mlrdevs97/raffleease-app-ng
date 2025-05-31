import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { BackLinkComponent } from '../../../../layout/components/back-link/back-link.component';
import { OrderDetailHeaderComponent } from '../../components/order-details/order-detail-header/order-detail-header.component';
import { OrderSummaryComponent } from '../../components/order-details/order-summary/order-summary.component';
import { OrderCommentComponent } from '../../components/order-details/order-comment/order-comment.component';
import { TicketsPreviewComponent, TicketsPreviewConfig } from '../../components/create-order/tickets-preview/tickets-preview.component';
import { Order, OrderItem, OrderStatus } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { OrderTicket, TicketStatus } from '../../../../core/models/ticket.model';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ErrorMessages } from '../../../../core/constants/error-messages';

@Component({
  selector: 'app-order-details-page',
  standalone: true,
  imports: [
    CommonModule,
    BackLinkComponent,
    OrderDetailHeaderComponent,
    OrderSummaryComponent,
    OrderCommentComponent,
    TicketsPreviewComponent
  ],
  templateUrl: './order-details-page.component.html'
})
export class OrderDetailsPageComponent implements OnInit {
  readonly order = signal<Order | null>(null);
  readonly isLoading = signal(false);

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
          console.log('Order details loaded:', order);
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