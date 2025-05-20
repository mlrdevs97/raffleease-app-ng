import { Raffle } from './raffle.model';

export interface RaffleSearchFilters {
  status?: string;
  title?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface RaffleSearchResponse {
  content: Raffle[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
} 