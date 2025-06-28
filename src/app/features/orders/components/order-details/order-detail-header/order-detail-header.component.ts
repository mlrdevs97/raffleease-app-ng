import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderStatus } from '../../../models/order.model';
import { RaffleStatus } from '../../../../raffles/models/raffle.model';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { getOrderStatusClasses } from '../../../../../core/utils/order.utils';

@Component({
  selector: 'app-order-detail-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './order-detail-header.component.html'
})
export class OrderDetailHeaderComponent {
  @Input() order!: Order;
  @Input() isUpdatingOrder = signal(false);
  @Input() currentAction = signal<'complete' | 'cancel' | 'setUnpaid' | 'refund' | null>(null);

  @Output() completeOrderRequested = new EventEmitter<void>();
  @Output() cancelOrderRequested = new EventEmitter<void>();
  @Output() setUnpaidRequested = new EventEmitter<void>();
  @Output() refundOrderRequested = new EventEmitter<void>();

  readonly OrderStatus = OrderStatus;
  readonly RaffleStatus = RaffleStatus;

  get statusClass(): string {
    return getOrderStatusClasses(this.order?.status);
  }

  /**
   * Determines which buttons should be shown based on order and raffle status
   */
  get availableActions(): Array<{
    action: 'complete' | 'cancel' | 'setUnpaid' | 'refund';
    text: string;
    variant: 'primary' | 'secondary' | 'gray';
    loadingText: string;
  }> {
    const orderStatus = this.order?.status;
    const raffleStatus = this.order?.raffleSummary?.status;
    
    if (!orderStatus || !raffleStatus) return [];

    // No buttons when raffle is PENDING or PAUSED
    if (raffleStatus === RaffleStatus.PENDING || raffleStatus === RaffleStatus.PAUSED) {
      return [];
    }

    // Order cancelled: No buttons
    if (orderStatus === OrderStatus.CANCELLED) {
      return [];
    }

    // Raffle ACTIVE + Order pending: Cancel and Complete Order buttons
    if (raffleStatus === RaffleStatus.ACTIVE && orderStatus === OrderStatus.PENDING) {
      return [
        {
          action: 'cancel',
          text: 'Cancel Order',
          variant: 'secondary',
          loadingText: 'Cancelling...'
        },
        {
          action: 'complete',
          text: 'Complete Order',
          variant: 'primary',
          loadingText: 'Completing...'
        }
      ];
    }

    // Order completed + Raffle active: Only Refund
    if (orderStatus === OrderStatus.COMPLETED && raffleStatus === RaffleStatus.ACTIVE) {
      return [
        {
          action: 'refund',
          text: 'Refund Order',
          variant: 'primary',
          loadingText: 'Refunding...'
        }
      ];
    }

    // Both raffle and order completed: Refund and Set Unpaid
    if (orderStatus === OrderStatus.COMPLETED && raffleStatus === RaffleStatus.COMPLETED) {
      return [
        {
          action: 'refund',
          text: 'Refund Order',
          variant: 'gray',
          loadingText: 'Refunding...'
        },
        {
          action: 'setUnpaid',
          text: 'Set to Unpaid',
          variant: 'secondary',
          loadingText: 'Setting to Unpaid...'
        }
      ];
    }

    // Default: no actions available
    return [];
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

  onRefundOrder(): void {
    this.refundOrderRequested.emit();
  }

  onActionClicked(action: 'complete' | 'cancel' | 'setUnpaid' | 'refund'): void {
    switch (action) {
      case 'complete':
        this.onCompleteOrder();
        break;
      case 'cancel':
        this.onCancelOrder();
        break;
      case 'setUnpaid':
        this.onSetUnpaid();
        break;
      case 'refund':
        this.onRefundOrder();
        break;
    }
  }
} 