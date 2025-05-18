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
  completedAt: Date;
  status: RaffleStatus;
  images: Image[];
  ticketPrice: number;
  firstTicketNumber: number;
  availableTickets: number;
  totalTickets: number;
  soldTickets: number;
  revenue: number;
  completionReason: CompletionReason;
  winningTicketId: number;
} 

export type RaffleStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'PAUSED';

export type CompletionReason = 'ALL_TICKETS_SOLD' | 'END_DATE_REACHED' | 'MANUALLY_COMPLETED';
  