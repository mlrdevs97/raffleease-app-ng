export interface Ticket {
  id: number;
  ticketNumber: string;
  status: TicketStatus;
  raffleId: number;
  customerId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTicket {
  id: number;
  ticketNumber: string;
  status: TicketStatus;
  raffleId: number;
  customerId?: number;
  createdAt: string;
  updatedAt: string;
  price: number;
}

export enum TicketStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD'
}

export interface TicketSearchFilters {
  ticketNumber?: string;
  status?: TicketStatus;
  customerId?: number;
} 