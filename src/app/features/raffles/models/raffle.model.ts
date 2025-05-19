import { Image } from "./image.model";

export interface Raffle {
  id: number;
  title: string;
  description: string;
  url: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  status: RaffleStatus;
  images: Image[];
  ticketPrice: number;
  firstTicketNumber: number;
  availableTickets: number;
  totalTickets: number;
  soldTickets: number;
  revenue: number;
  completionReason: CompletionReason | null;
  winningTicketId: number | null;
} 

export enum RaffleStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED'
}

export enum CompletionReason {
  ALL_TICKETS_SOLD = 'ALL_TICKETS_SOLD',
  END_DATE_REACHED = 'END_DATE_REACHED',
  MANUALLY_COMPLETED = 'MANUALLY_COMPLETED'
}
  