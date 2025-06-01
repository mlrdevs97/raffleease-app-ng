import { Component, Output, EventEmitter, computed, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderTicket, TicketStatus } from '../../../../../core/models/ticket.model';
import { TicketSelectionService } from '../../../services/ticket-selection.service';
import { CartService } from '../../../services/cart.service';

export interface TicketsPreviewConfig {
  mode: 'preview' | 'readonly';
  title?: string;
  showActions?: boolean;
  showStatus?: boolean;
}

@Component({
  selector: 'app-tickets-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets-preview.component.html'
})
export class TicketsPreviewComponent {
  @Input() config: TicketsPreviewConfig = {
    mode: 'preview',
    title: 'Selected Tickets',
    showActions: true,
    showStatus: false
  };
  
  @Input() ticketsData: OrderTicket[] = [];
  @Output() ticketRemoved = new EventEmitter<string>();

  private useService = signal(true);

  constructor(
    private ticketSelectionService: TicketSelectionService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    if (this.ticketsData && this.ticketsData.length > 0) {
      this.useService.set(false);
    }
  }

  get tickets() {
    if (this.useService()) {
      return this.ticketSelectionService.getSelectedTickets();
    }
    return signal(this.ticketsData);
  }

  get isRemovingTickets() {
    return this.cartService.getIsReleasingTickets();
  }

  calculateTotalPrice(): number {
    if (this.useService()) {
      return this.ticketSelectionService.getTotalPrice();
    }
    return this.ticketsData.reduce((sum, ticket) => sum + ticket.price, 0);
  }

  get ticketCount(): number {
    if (this.useService()) {
      return this.tickets()?.length || 0;
    }
    return this.ticketsData.length;
  }

  removeTicket(ticketNumber: string): void {
    if (this.config.mode === 'preview' && !this.isRemovingTickets()) {
      this.ticketSelectionService.removeTicket(ticketNumber);
      this.ticketRemoved.emit(ticketNumber);
    }
  }

  addTicket(ticket: OrderTicket): void {
    if (this.config.mode === 'preview') {
      this.ticketSelectionService.addTicket(ticket);
    }
  }

  addTickets(tickets: OrderTicket[]): void {
    if (this.config.mode === 'preview') {
      this.ticketSelectionService.addTickets(tickets);
    }
  }

  clearTickets(): void {
    if (this.config.mode === 'preview' && !this.isRemovingTickets()) {
      this.ticketSelectionService.clearTickets();
    }
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  get displayTitle(): string {
    return this.config.title || 'Tickets';
  }

  get shouldShowActions(): boolean {
    return this.config.showActions !== false && this.config.mode === 'preview';
  }

  get shouldShowStatus(): boolean {
    return this.config.showStatus === true;
  }

  getStatusClasses(status: string): string {
    const statusUpper = status.toUpperCase();
    
    switch (statusUpper) {
      case TicketStatus.RESERVED:
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800 border-transparent';
      case TicketStatus.AVAILABLE:
      case 'AVAILABLE':
        return 'bg-blue-100 text-blue-800 border-transparent';
      case TicketStatus.SOLD:
      case 'SOLD':
        return 'bg-green-100 text-green-800 border-transparent';
      default:
        return 'bg-gray-100 text-gray-800 border-transparent';
    }
  }
} 