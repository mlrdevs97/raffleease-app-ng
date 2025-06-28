import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderRafflePreviewComponent } from '../order-raffle-preview/order-raffle-preview.component';
import { Order, OrderStatus, OrderRaffleSummary } from '../../../models/order.model';
import { getOrderStatusClasses } from '../../../../../core/utils/order.utils';

@Component({
  selector: 'app-orders-table-row',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OrderRafflePreviewComponent,
    CurrencyPipe,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './orders-table-row.component.html',
  styles: [`
    .table-cell-base {
      @apply relative break-words p-4 border-b border-zinc-950/5;
      @apply first:pl-2 last:pr-2 sm:first:pl-1 sm:last:pr-1;
    }
    
    .cell-link {
      @apply absolute inset-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset;
    }
  `]
})
export class OrdersTableRowComponent {
  @Input() order!: Order;

  get raffleDisplaySummary(): OrderRaffleSummary {
    return this.order.raffleSummary;
  }

  getRaffleLink(): string[] {
    return ['/raffles', this.order.raffleSummary.id.toString()];
  }

  getStatusClass(status: OrderStatus): string {
    return getOrderStatusClasses(status);
  }
}