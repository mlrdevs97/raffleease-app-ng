import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-summary.component.html',
  styles: [`
    .summary-cell {
      @apply relative;
    }
    
    .cell-link {
      @apply absolute inset-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset;
    }
  `]
})
export class OrderSummaryComponent {
  @Input() order!: Order;

  get customerFullName(): string {
    return this.order?.customer?.fullName || '';
  }

  get ticketCount(): string {
    const count = this.order?.orderItems?.length || 0;
    return count === 1 ? '1 ticket sold' : `${count} tickets sold`;
  }

  get formattedAmount(): string {
    return `US$${this.order?.payment?.total?.toFixed(2)}`;
  }

  get paymentMethodDisplay(): string {
    const payment = this.order?.payment;
    if (payment?.paymentMethod) {
      return payment.paymentMethod;
    }
    return 'Unknown';
  }
} 