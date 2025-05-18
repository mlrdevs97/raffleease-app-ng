import { ImageDTO } from './image.model';
import { TicketsCreate } from './tickets-create.model';

export interface RaffleCreate {
  title: string;
  description: string;
  endDate: string; 
  images: ImageDTO[];
  ticketsInfo: TicketsCreate;
} 