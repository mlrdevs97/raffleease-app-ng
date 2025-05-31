import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary.component.html'
})
export class OrderSummaryComponent {
  @Input() order!: Order;

  get customerFullName(): string {
    return this.order?.customer?.fullName || '';
  }

  get formattedAmount(): string {
    return `US$${this.order?.payment?.total?.toFixed(2)}`;
  }

  get paymentMethodDisplay(): string {
    const payment = this.order?.payment;
    if (payment?.paymentMethod) {
      // For this demo, we'll show a credit card format
      return 'American Express •••• 1254';
    }
    return 'Unknown';
  }
} 