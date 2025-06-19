import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OrdersTableComponent } from '../../../../orders/components/shared/orders-table/orders-table.component';
import { OrdersService } from '../../../../orders/services/orders.service';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { Order } from '../../../../orders/models/order.model';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { Raffle, RaffleStatus } from '../../../models/raffle.model';

@Component({
  selector: 'app-raffle-orders',
  imports: [CommonModule, RouterLink, OrdersTableComponent, ButtonComponent],
  standalone: true,
  templateUrl: './raffle-orders.component.html'
})
export class RaffleOrdersComponent implements OnInit {
  @Input() raffleId!: number;
  @Input() raffle?: Raffle;

  orders = signal<Order[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  raffleOrders = computed(() => this.orders().slice(0, 5));
  hasMoreOrders = computed(() => this.orders().length > 5);
  
  isRaffleActiveForOrders = computed(() => {
    return this.raffle?.status === RaffleStatus.ACTIVE;
  });

  constructor(
    private ordersService: OrdersService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadRaffleOrders();
  }

  private loadRaffleOrders(): void {
    if (!this.raffleId) {
      this.errorMessage.set('Raffle ID is required');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.ordersService.searchOrders({ raffleId: this.raffleId }, 0, 10, 'createdAt,desc').subscribe({ 
      next: (response) => {
        this.orders.set(response.content);
      },
      error: (error) => {
        const errorMsg = this.errorHandler.getErrorMessage(error);
        this.errorMessage.set(errorMsg);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
} 