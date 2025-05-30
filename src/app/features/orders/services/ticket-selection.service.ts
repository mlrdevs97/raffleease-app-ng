import { Injectable, signal } from '@angular/core';
import { OrderTicket } from '../../../core/models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketSelectionService {
  private selectedTickets = signal<OrderTicket[]>([]);

  /**
   * Get the current selected tickets as a signal
   */
  getSelectedTickets() {
    return this.selectedTickets.asReadonly();
  }

  /**
   * Add a ticket to the selection
   */
  addTicket(ticket: OrderTicket): void {
    this.selectedTickets.update(currentTickets => {
      // Check if ticket already exists
      const exists = currentTickets.some(t => t.ticketNumber === ticket.ticketNumber);
      
      if (!exists) {
        return [...currentTickets, ticket];
      }
      return currentTickets;
    });
  }

  /**
   * Add multiple tickets to the selection
   */
  addTickets(tickets: OrderTicket[]): void {
    this.selectedTickets.update(currentTickets => {
      const newTickets = tickets.filter(ticket => 
        !currentTickets.some(t => t.ticketNumber === ticket.ticketNumber)
      );
      return [...currentTickets, ...newTickets];
    });
  }

  /**
   * Remove a ticket from the selection
   */
  removeTicket(ticketNumber: string): void {
    this.selectedTickets.update(currentTickets => 
      currentTickets.filter(ticket => ticket.ticketNumber !== ticketNumber)
    );
  }

  /**
   * Clear all selected tickets
   */
  clearTickets(): void {
    this.selectedTickets.set([]);
  }

  /**
   * Get the total price of all selected tickets
   */
  getTotalPrice(): number {
    return this.selectedTickets().reduce((total, ticket) => total + (ticket.price || 0), 0);
  }

  /**
   * Get the count of selected tickets
   */
  getTicketCount(): number {
    return this.selectedTickets().length;
  }
} 