import { Injectable, signal, OnDestroy } from '@angular/core';
import { Subject, switchMap, tap, catchError, EMPTY, filter, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { TicketQueryService } from './ticket-query.service';
import { Ticket, TicketSearchFilters, TicketStatus } from '../../../core/models/ticket.model';
import { PageResponse } from '../../../core/models/pagination.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TicketSearchService implements OnDestroy {
  suggestions = signal<Ticket[]>([]);
  isSearchLoading = signal(false);
  noSearchResults = signal(false);
  searchError = signal<string | null>(null);
  
  private searchSubject = new Subject<{ term: string; raffleId: number; status?: TicketStatus; forceRefresh?: boolean }>();
  private searchSubscription?: Subscription;
  
  constructor(
    private ticketQueryService: TicketQueryService,
    private errorHandler: ErrorHandlerService
  ) {}
  
  /**
   * Initialize search functionality for a component
   * @param minSearchLength Minimum characters required to trigger search (default: 1 for ticket numbers)
   * @param debounceMs Debounce time in milliseconds (default: 300)
   */
  initializeSearch(minSearchLength: number = 1, debounceMs: number = 300) {
    this.destroySubscription();
    
    this.searchSubscription = this.searchSubject.pipe(
      filter(({ term }) => term.trim().length >= minSearchLength || term.trim().length === 0),
      debounceTime(debounceMs),
      distinctUntilChanged((prev, curr) => 
        !curr.forceRefresh && 
        prev.term === curr.term && 
        prev.raffleId === curr.raffleId && 
        prev.status === curr.status
      ),
      tap(() => {
        this.isSearchLoading.set(true);
        this.noSearchResults.set(false);
        this.searchError.set(null);
      }),
      switchMap(({ term, raffleId, status }) => {
        if (!term || term.trim().length < minSearchLength) {
          this.suggestions.set([]);
          this.isSearchLoading.set(false);
          return EMPTY;
        }
        
        const filters: TicketSearchFilters = {
          ticketNumber: term,
          status: status ?? undefined
        };   
                
        return this.ticketQueryService.search(raffleId, filters, 0, 10).pipe(
          tap((response: PageResponse<Ticket>) => {
            this.suggestions.set(response.content);
            this.noSearchResults.set(response.content.length === 0);
            this.isSearchLoading.set(false);
            this.searchError.set(null);
          }),
          catchError((error) => {
            this.isSearchLoading.set(false);
            this.suggestions.set([]);
            this.noSearchResults.set(false);
            this.searchError.set(this.errorHandler.getErrorMessage(error));            
            return EMPTY;
          })
        );
      })
    ).subscribe();
  }
  
  /**
   * Search for tickets with optional status filter
   * @param term Search term (ticket number)
   * @param raffleId ID of the raffle to search within
   * @param status Optional ticket status to filter by
   */
  search(term: string, raffleId: number, status?: TicketStatus): void {
    this.searchSubject.next({ term, raffleId, status });
  }
  
  forceRefreshSearch(term: string, raffleId: number, status?: TicketStatus): void {
    this.searchSubject.next({ term, raffleId, status, forceRefresh: true });
  }
  
  resetSearch(): void {
    this.suggestions.set([]);
    this.isSearchLoading.set(false);
    this.noSearchResults.set(false);
    this.searchError.set(null);
  }
  
  clearSuggestions(): void {
    this.suggestions.set([]);
    this.noSearchResults.set(false);
    this.searchError.set(null);
  }

  clearError(): void {
    this.searchError.set(null);
  }

  destroySubscription(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
      this.searchSubscription = undefined;
    }
  }

  ngOnDestroy(): void {
    this.destroySubscription();
  }
} 