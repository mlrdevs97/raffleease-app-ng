import { Ticket } from "./ticket.model";

export enum CartStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CLOSED = 'CLOSED'
}

export interface Cart {
  id: number;
  userId: number;
  tickets: Ticket[]; 
  status: CartStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationRequest {
  ticketIds: number[];
} 