import { Image } from './image.model';
import { TicketsCreate } from './tickets-create.model';

export interface RaffleCreate {
  title: string;
  description: string;
  startDate?: string;
  endDate: string; 
  images: Image[];
  ticketsInfo: TicketsCreate;
} 