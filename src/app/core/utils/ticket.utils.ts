import { Ticket, OrderTicket } from '../models/ticket.model';
import { Raffle } from '../../features/raffles/models/raffle.model';

/**
 * Convert a Ticket to an OrderTicket with price from raffle data
 */
export function createOrderTicket(ticket: Ticket, raffle: Raffle): OrderTicket {
  return {
    ...ticket,
    price: raffle.ticketPrice
  };
}

/**
 * Convert multiple Tickets to OrderTickets with price from raffle data
 */
export function createOrderTickets(tickets: Ticket[], raffle: Raffle): OrderTicket[] {
  return tickets.map(ticket => createOrderTicket(ticket, raffle));
} 