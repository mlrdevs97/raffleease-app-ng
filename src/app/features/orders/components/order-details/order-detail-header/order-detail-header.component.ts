import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'app-order-detail-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail-header.component.html'
})
export class OrderDetailHeaderComponent {
  @Input() order!: Order;

  get statusClass(): string {
    switch (this.order?.status) {
      case OrderStatus.COMPLETED:
        return 'border-transparent bg-green-100 text-green-800 hover:bg-green-100';
      case OrderStatus.PENDING:
        return 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case OrderStatus.CANCELLED:
        return 'border-transparent bg-red-100 text-red-800 hover:bg-red-100';
      case OrderStatus.REFUNDED:
        return 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  }

  onCancelOrder(): void {
    console.log('Cancel order:', this.order.id);
  }

  onRefundOrder(): void {
    console.log('Refund order:', this.order.id);
  }
} 