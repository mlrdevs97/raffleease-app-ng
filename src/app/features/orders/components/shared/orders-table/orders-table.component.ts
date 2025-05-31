import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersTableRowComponent } from '../order-table-row/orders-table-row.component';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [CommonModule, OrdersTableRowComponent],
  templateUrl: './orders-table.component.html',
})
export class OrdersTableComponent {
  @Input() orders: Order[] = [];
}