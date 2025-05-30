import { Component, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderTicket } from '../../../../../core/models/ticket.model';
import { TicketSelectionService } from '../../../services/ticket-selection.service';

@Component({
  selector: 'app-tickets-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets-preview.component.html'
})
export class TicketsPreviewComponent {
  @Output() ticketRemoved = new EventEmitter<string>();

  constructor(private ticketSelectionService: TicketSelectionService) {}

  /**
   * Get the selected tickets from the shared service
   */
  get tickets() {
    return this.ticketSelectionService.getSelectedTickets();
  }

  /**
   * Calculate the total price of all selected tickets
   */
  calculateTotalPrice(): number {
    return this.ticketSelectionService.getTotalPrice();
  }

  /**
   * Remove a ticket from the preview
   */
  removeTicket(ticketNumber: string): void {
    this.ticketSelectionService.removeTicket(ticketNumber);
    this.ticketRemoved.emit(ticketNumber);
  }

  /**
   * Add a ticket to the preview (for external use)
   */
  addTicket(ticket: OrderTicket): void {
    this.ticketSelectionService.addTicket(ticket);
  }

  /**
   * Add multiple tickets to the preview (for external use)
   */
  addTickets(tickets: OrderTicket[]): void {
    this.ticketSelectionService.addTickets(tickets);
  }

  /**
   * Clear all tickets from the preview
   */
  clearTickets(): void {
    this.ticketSelectionService.clearTickets();
  }
} 