import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RafflesHeaderComponent } from '../../components/raffles/raffles-header/raffles-header.component';
import { RaffleCardListComponent } from '../../components/raffles/raffle-card-list/raffle-card-list.component';
import { Raffle } from '../../models/raffle.model';
import { RaffleQueryService } from '../../services/raffle-query.service';
import { RaffleSearchService } from '../../services/raffle-search.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { RaffleSearchFilters } from '../../models/raffle-search.model';
import { AuthService } from '../../../auth/services/auth.service';
import { PageResponse } from '../../../../core/models/pagination.model';

@Component({
  selector: 'app-raffles-page',
  standalone: true,
  imports: [CommonModule, RafflesHeaderComponent, RaffleCardListComponent],
  templateUrl: './raffles-page.component.html',
})
export class RafflesPageComponent implements OnInit, OnDestroy {
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
  
  searchTerm = signal<string>('');
  selectedStatus = signal<string | null>(null);
  sortBy = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  protected readonly Math = Math;

  constructor(
    public raffleQueryService: RaffleQueryService,
    public raffleSearchService: RaffleSearchService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService
  ) {}

  private filters = computed(() => {
    const filters: RaffleSearchFilters = {};
    
    if (this.searchTerm() && this.searchTerm().trim().length > 0) {
      filters.title = this.searchTerm().trim();
    }
    
    if (this.selectedStatus() && this.selectedStatus() !== 'ANY') {
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
    
    // Initialize search service for suggestions
    this.raffleSearchService.initializeSearch(2, 300);
    this.sortBy.set('createdAt');
    this.sortDirection.set('desc');
    
    // Load initial data
    this.loadRaffles();
  }

  ngOnDestroy(): void {
    // Clean up search subscription and reset state
    this.raffleSearchService.destroySubscription();
    this.raffleSearchService.resetSearch();
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
  
  onSearchChange(term: string): void {
    this.raffleSearchService.search(term);
    
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
    // Clear suggestions after selection
    this.raffleSearchService.clearSuggestions();
  }
  
  // Status filter handler
  onStatusChange(status: string): void {
    this.selectedStatus.set(status === 'ANY' ? null : status);
    this.loadRaffles(0);
  }
  
  // Sort handler
  onSortChange(sortData: {sortBy: string, sortDirection: 'asc' | 'desc'}): void {
    this.sortBy.set(sortData.sortBy);
    this.sortDirection.set(sortData.sortDirection);
    this.loadRaffles(0);
  }
  
  onRaffleDeleted(raffleId: number): void {
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

  get suggestions() {
    return this.raffleSearchService.suggestions();
  }

  get isSearchLoading() {
    return this.raffleSearchService.isSearchLoading();
  }

  get noSearchResults() {
    return this.raffleSearchService.noSearchResults();
  }
} 
