import { Component, Output, EventEmitter, computed, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderTicket } from '../../../../../core/models/ticket.model';
import { TicketSelectionService } from '../../../services/ticket-selection.service';

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

  constructor(private ticketSelectionService: TicketSelectionService) {}

  ngOnInit(): void {
    // If ticketsData is provided, use it instead of the service
    if (this.ticketsData && this.ticketsData.length > 0) {
      this.useService.set(false);
    }
  }

  /**
   * Get the tickets to display - either from service or from input
   */
  get tickets() {
    if (this.useService()) {
      return this.ticketSelectionService.getSelectedTickets();
    }
    return signal(this.ticketsData);
  }

  /**
   * Calculate the total price of all tickets
   */
  calculateTotalPrice(): number {
    if (this.useService()) {
      return this.ticketSelectionService.getTotalPrice();
    }
    return this.ticketsData.reduce((sum, ticket) => sum + ticket.price, 0);
  }

  /**
   * Get the number of tickets
   */
  get ticketCount(): number {
    if (this.useService()) {
      return this.tickets()?.length || 0;
    }
    return this.ticketsData.length;
  }

  /**
   * Remove a ticket from the preview (only in preview mode)
   */
  removeTicket(ticketNumber: string): void {
    if (this.config.mode === 'preview') {
      this.ticketSelectionService.removeTicket(ticketNumber);
      this.ticketRemoved.emit(ticketNumber);
    }
  }

  /**
   * Add a ticket to the preview (for external use in preview mode)
   */
  addTicket(ticket: OrderTicket): void {
    if (this.config.mode === 'preview') {
      this.ticketSelectionService.addTicket(ticket);
    }
  }

  /**
   * Add multiple tickets to the preview (for external use in preview mode)
   */
  addTickets(tickets: OrderTicket[]): void {
    if (this.config.mode === 'preview') {
      this.ticketSelectionService.addTickets(tickets);
    }
  }

  /**
   * Clear all tickets from the preview (only in preview mode)
   */
  clearTickets(): void {
    if (this.config.mode === 'preview') {
      this.ticketSelectionService.clearTickets();
    }
  }

  /**
   * Format price display
   */
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  /**
   * Get display title
   */
  get displayTitle(): string {
    return this.config.title || 'Tickets';
  }

  /**
   * Check if actions should be shown
   */
  get shouldShowActions(): boolean {
    return this.config.showActions !== false && this.config.mode === 'preview';
  }

  /**
   * Check if status should be shown
   */
  get shouldShowStatus(): boolean {
    return this.config.showStatus === true;
  }
} 