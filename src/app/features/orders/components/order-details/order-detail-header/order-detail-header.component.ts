import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderStatus } from '../../../models/order.model';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-order-detail-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './order-detail-header.component.html'
})
export class OrderDetailHeaderComponent {
  @Input() order!: Order;
  @Input() isUpdatingOrder = signal(false);
  @Input() currentAction = signal<'complete' | 'cancel' | 'setUnpaid' | null>(null);

  @Output() completeOrderRequested = new EventEmitter<void>();
  @Output() cancelOrderRequested = new EventEmitter<void>();
  @Output() setUnpaidRequested = new EventEmitter<void>();

  readonly OrderStatus = OrderStatus;

  get statusClass(): string {
    switch (this.order?.status) {
      case OrderStatus.COMPLETED:
        return 'border-transparent bg-green-100 text-green-800 hover:bg-green-100';
      case OrderStatus.PENDING:
        return 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case OrderStatus.CANCELLED:
        return 'border-transparent bg-red-100 text-red-800 hover:bg-red-100';
      case OrderStatus.REFUNDED:
      case OrderStatus.UNPAID:
        default:
        return 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  }

  get primaryButtonText(): string {
    return this.order?.status === OrderStatus.COMPLETED ? 'Set to Unpaid' : 'Complete Order';
  }

  get primaryButtonLoadingText(): string {
    return this.order?.status === OrderStatus.COMPLETED ? 'Setting to Unpaid...' : 'Completing...';
  }

  get primaryButtonAction(): string {
    return this.order?.status === OrderStatus.COMPLETED ? 'setUnpaid' : 'complete';
  }

  onCancelOrder(): void {
    this.cancelOrderRequested.emit();
  }

  onCompleteOrder(): void {
    this.completeOrderRequested.emit();
  }

  onSetUnpaid(): void {
    this.setUnpaidRequested.emit();
  }

  onPrimaryAction(): void {
    if (this.order?.status === OrderStatus.COMPLETED) {
      this.onSetUnpaid();
    } else {
      this.onCompleteOrder();
    }
  }
} 