import { Image } from './image.model';

export interface RaffleEdit {
  title?: string;
  description?: string;
  endDate?: string;
  images?: Image[];
  ticketPrice?: number;
  totalTickets?: number;
} 