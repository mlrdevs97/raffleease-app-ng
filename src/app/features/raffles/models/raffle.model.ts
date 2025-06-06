import { Image } from "./image.model";

export interface RaffleStatistics {
  id: number;
  raffleId: number;
  availableTickets: number;
  soldTickets: number;
  revenue: number;
  averageOrderValue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  unpaidOrders: number;
  refundedOrders: number;
  participants: number;
  ticketsPerParticipant: number;
  firstSaleDate: Date | null;
  lastSaleDate: Date | null;
  dailySalesVelocity: number | null;
}

export interface Raffle {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  status: RaffleStatus;
  images: Image[];
  ticketPrice: number;
  firstTicketNumber: number;
  totalTickets: number;
  completionReason: CompletionReason | null;
  winningTicketId: number | null;
  associationId: number;
  statistics: RaffleStatistics;
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
  