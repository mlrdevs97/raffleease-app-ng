import { Injectable, signal, inject } from '@angular/core';
import { OrderTicket } from '../../../core/models/ticket.model';
import { CartService } from './cart.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TicketSelectionService {
  private selectedTickets = signal<OrderTicket[]>([]);
  private cartService = inject(CartService);
  private errorHandler = inject(ErrorHandlerService);

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
   * Remove a ticket from the selection and release it from the cart
   */
  removeTicket(ticketNumber: string): void {
    const currentTickets = this.selectedTickets();
    const ticketToRemove = currentTickets.find(t => t.ticketNumber === ticketNumber);
    
    if (!ticketToRemove) {
      return;
    }
 
    if (ticketToRemove.id) {
      this.cartService.releaseTickets([ticketToRemove.id]).subscribe({
        next: () => {
          this.selectedTickets.update(tickets => tickets.filter(t => t.ticketNumber !== ticketNumber));
        },
        error: error => {
          const errorMessage = this.errorHandler.getErrorMessage(error);
        }
      });
    }
  }

  /**
   * Remove multiple tickets from the selection and release them from the cart
   */
  removeTickets(ticketNumbers: string[]): void {
    const currentTickets = this.selectedTickets();
    const ticketsToRemove = currentTickets.filter(t => ticketNumbers.includes(t.ticketNumber));
    
    if (ticketsToRemove.length === 0) {
      return;
    }

    const ticketIdsToRelease = ticketsToRemove
      .filter(ticket => ticket.id)
      .map(ticket => ticket.id);

    if (ticketIdsToRelease.length > 0) {
      this.cartService.releaseTickets(ticketIdsToRelease).subscribe({
        next: () => {
          this.selectedTickets.update(tickets => tickets.filter(ticket => !ticketNumbers.includes(ticket.ticketNumber)));
        },
        error: error => {
          const errorMessage = this.errorHandler.getErrorMessage(error);
        }
      });
    }
  }

  /**
   * Clear all selected tickets and release them from the cart
   */
  clearTickets(): void {
    const currentTickets = this.selectedTickets();
    const ticketIdsToRelease = currentTickets
      .filter(ticket => ticket.id)
      .map(ticket => ticket.id);

    this.selectedTickets.set([]);

    if (ticketIdsToRelease.length > 0) {
      this.cartService.releaseTickets(ticketIdsToRelease).subscribe({
        next: () => {
          this.selectedTickets.set([]);
        },
        error: error => {
          const errorMessage = this.errorHandler.getErrorMessage(error);
          console.error('Failed to release all tickets:', errorMessage, error);
        }
      });
    }
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