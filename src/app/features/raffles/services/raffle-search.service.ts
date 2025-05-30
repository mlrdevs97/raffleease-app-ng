import { Injectable, signal, OnDestroy } from '@angular/core';
import { Subject, switchMap, tap, catchError, EMPTY, filter, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { RaffleQueryService } from './raffle-query.service';
import { Raffle } from '../models/raffle.model';
import { RaffleSearchFilters } from '../models/raffle-search.model';
import { PageResponse } from '../../../core/models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class RaffleSearchService implements OnDestroy {
  suggestions = signal<Raffle[]>([]);
  isSearchLoading = signal(false);
  noSearchResults = signal(false);
  
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  
  constructor(private raffleQueryService: RaffleQueryService) {}
  
  /**
   * Initialize search functionality for a component
   * @param minSearchLength Minimum characters required to trigger search (default: 2)
   * @param debounceMs Debounce time in milliseconds (default: 300)
   */
  initializeSearch(minSearchLength: number = 2, debounceMs: number = 300) {
    // Clean up previous subscription
    this.destroySubscription();
    
    // Setup new subscription with custom parameters
    this.searchSubscription = this.searchSubject.pipe(
      filter(term => term.trim().length >= minSearchLength || term.trim().length === 0),
      debounceTime(debounceMs),
      distinctUntilChanged(),
      tap(() => {
        this.isSearchLoading.set(true);
        this.noSearchResults.set(false);
      }),
      switchMap(term => {
        if (!term || term.trim().length < minSearchLength) {
          this.suggestions.set([]);
          this.isSearchLoading.set(false);
          return EMPTY;
        }
        
        const filters: RaffleSearchFilters = {
          title: term
        };
        
        return this.raffleQueryService.search(filters, 0, 10).pipe(
          tap((response: PageResponse<Raffle>) => {
            this.suggestions.set(response.content);
            this.noSearchResults.set(response.content.length === 0);
            this.isSearchLoading.set(false);
          }),
          catchError(() => {
            this.isSearchLoading.set(false);
            this.suggestions.set([]);
            this.noSearchResults.set(true);
            return EMPTY;
          })
        );
      })
    ).subscribe();
  }
  
  /**
   * Trigger a search with the given term
   */
  search(term: string): void {
    this.searchSubject.next(term);
  }
  
  /**
   * Reset search state and clear suggestions
   */
  resetSearch(): void {
    this.suggestions.set([]);
    this.isSearchLoading.set(false);
    this.noSearchResults.set(false);
  }
  
  /**
   * Clear suggestions and reset loading states
   */
  clearSuggestions(): void {
    this.suggestions.set([]);
    this.noSearchResults.set(false);
  }

  /**
   * Destroy the search subscription to prevent memory leaks
   */
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