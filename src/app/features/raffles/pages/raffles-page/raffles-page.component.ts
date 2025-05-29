import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RafflesHeaderComponent } from '../../components/raffles/raffles-header/raffles-header.component';
import { RaffleCardListComponent } from '../../components/raffles/raffle-card-list/raffle-card-list.component';
import { Raffle } from '../../models/raffle.model';
import { RaffleQueryService } from '../../services/raffle-query.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { EMPTY, Subject, Subscription, catchError, switchMap, tap } from 'rxjs';
import { RaffleSearchFilters } from '../../models/raffle-search.model';
import { AuthService } from '../../../auth/services/auth.service';
import { PageResponse } from '../../../../core/models/pagination.model';

@Component({
  selector: 'app-raffles-page',
  standalone: true,
  imports: [CommonModule, RafflesHeaderComponent, RaffleCardListComponent],
  templateUrl: './raffles-page.component.html',
})
export class RafflesPageComponent implements OnInit {
  // Data signals
  raffles = signal<Raffle[]>([]);
  pagination = signal<{
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }>({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20
  });
  errorMessage = signal<string | null>(null);
  associationId = signal<number>(0);
  
  // Search, filter, sort signals
  searchTerm = signal<string>('');
  selectedStatus = signal<string | null>(null);
  sortBy = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Suggestion signals
  suggestions = signal<Raffle[]>([]);
  isSearchLoading = signal(false);
  noSearchResults = signal(false);
  
  // Search subject for handling search requests
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  
  protected readonly Math = Math;

  constructor(
    public raffleQueryService: RaffleQueryService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService
  ) {}

  // Computed filter object
  private filters = computed(() => {
    const filters: RaffleSearchFilters = {};
    
    if (this.searchTerm() && this.searchTerm().trim().length > 0) {
      filters.title = this.searchTerm().trim();
    }
    
    if (this.selectedStatus() && this.selectedStatus() !== 'All statuses') {
      filters.status = this.selectedStatus()!.toUpperCase();
    }
    
    return filters;
  });

  private sort = computed(() => {
    return `${this.sortBy()},${this.sortDirection()}`;
  });

  ngOnInit(): void {
    // Get the association ID from auth service
    const associationId = this.authService.getAssociationId();
    if (associationId) {
      this.associationId.set(associationId);
    }
    
    // Setup search subscription with switchMap to cancel previous requests
    this.searchSubscription = this.searchSubject.pipe(
      tap(() => {
        this.isSearchLoading.set(true);
        this.noSearchResults.set(false);
      }),
      switchMap(term => {
        if (!term || term.trim().length < 2) {
          this.suggestions.set([]);
          this.isSearchLoading.set(false);
          return EMPTY;
        }
        
        const filters: RaffleSearchFilters = {
          ...this.filters(),
          title: term
        };
        
        return this.raffleQueryService.search(filters, 0, 10, this.sort()).pipe(
          tap((response: PageResponse<Raffle>) => {
            this.suggestions.set(response.content);
            this.noSearchResults.set(response.content.length === 0);
            this.isSearchLoading.set(false);
          }),
          catchError(error => {
            this.isSearchLoading.set(false);
            this.suggestions.set([]);
            this.noSearchResults.set(true);
            return EMPTY;
          })
        );
      })
    ).subscribe();
    
    // Load initial data
    this.loadRaffles();
  }

  loadRaffles(page: number = 0): void {
    this.pagination.update(current => ({ ...current, currentPage: page }));
    this.errorMessage.set(null);
    
    this.raffleQueryService.search(
      this.filters(), 
      page, 
      this.pagination().pageSize, 
      this.sort()
    ).subscribe({
      next: (response: PageResponse<Raffle>) => {
        this.raffles.set(response.content);
        this.pagination.set({
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          currentPage: response.number,
          pageSize: response.size
        });
      },
      error: (error) => {
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        this.raffles.set([]);
        this.pagination.update(current => ({ 
          ...current,
          totalElements: 0,
          totalPages: 0
        }));
      }
    });
  }

  onPageChange(page: number): void {
    this.loadRaffles(page);
  }
  
  // Search handlers
  onSearchChange(term: string): void {
    if (term.trim().length >= 2 || term.trim().length === 0) {
      console.log('term', term);
      this.searchSubject.next(term);
    }
    
    if (term.trim().length === 0) {
      this.searchTerm.set('');
      this.loadRaffles(0);
    }
  }
  
  onSearchEnterPressed(term: string): void {
    if (term.trim().length >= 2) {
      this.searchTerm.set(term);
      this.loadRaffles(0);
    }
  }
  
  onSuggestionSelected(raffle: Raffle): void {
    console.log('raffle', raffle);
    this.searchTerm.set(raffle.title);
    this.loadRaffles(0);
  }
  
  // Status filter handler
  onStatusChange(status: string): void {
    this.selectedStatus.set(status === 'All statuses' ? null : status);
    this.loadRaffles(0);
  }
  
  // Sort handler
  onSortChange(sortData: {sortBy: string, sortDirection: 'asc' | 'desc'}): void {
    this.sortBy.set(sortData.sortBy);
    this.sortDirection.set(sortData.sortDirection);
    this.loadRaffles(0);
  }
  
  // Handle raffle deletion
  onRaffleDeleted(raffleId: number): void {
    // Update the raffles list by filtering out the deleted raffle
    const updatedRaffles = this.raffles().filter(raffle => raffle.id !== raffleId);
    this.raffles.set(updatedRaffles);
    
    // Update total count
    this.pagination.update(current => ({
      ...current,
      totalElements: current.totalElements - 1
    }));
    
    // If the page is now empty and it's not the first page, go to previous page
    if (updatedRaffles.length === 0 && this.pagination().currentPage > 0) {
      this.loadRaffles(this.pagination().currentPage - 1);
    }
  }
  
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
} 
