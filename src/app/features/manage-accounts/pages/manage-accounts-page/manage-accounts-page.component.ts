import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersListComponent } from '../../components/users-list/users-list.component';
import { UsersSearchDialogComponent, UserSearchResult } from '../../components/users-search-dialog/users-search-dialog.component';
import { ManageAccountsToolbarComponent } from '../../components/manage-accounts-toolbar/manage-accounts-toolbar.component';
import { ManageAccountsService, UserSearchFilters } from '../../services/manage-accounts.services';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { User } from '../../../../core/models/user.model';
import { PaginationComponent, PaginationInfo } from '../../../../shared/components/pagination/pagination.component';
import { PageResponse } from '../../../../core/models/pagination.model';

@Component({
  selector: 'app-manage-accounts-page',
  standalone: true,
  imports: [
    CommonModule, 
    UsersListComponent, 
    UsersSearchDialogComponent, 
    ManageAccountsToolbarComponent,
    PaginationComponent
  ],
  templateUrl: './manage-accounts-page.component.html',
})
export class ManageAccountsPageComponent implements OnInit {
  private readonly manageAccountsService = inject(ManageAccountsService);
  private readonly errorHandler = inject(ErrorHandlerService);

  users = signal<User[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  isSearchDialogOpen = signal<boolean>(false);

  searchTerm = signal<string>('');
  selectedRole = signal<string | null>(null);
  sortBy = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  pagination = signal<PaginationInfo>({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 5
  });

  private filters = computed(() => {
    const filters: UserSearchFilters = {};

    if (this.searchTerm() && this.searchTerm().trim().length > 0) {
      filters.fullName = this.searchTerm().trim();
    }

    const role = this.selectedRole();
    if (role) {
      filters.role = role;
    }

    return filters;
  });

  private sort = computed(() => {
    return this.sortBy() ? `${this.sortBy()},${this.sortDirection()}` : undefined;
  });

  ngOnInit(): void {
    this.sortBy.set('createdAt');
    this.sortDirection.set('desc');
    this.loadUsers();
  }

  loadUsers(page: number = 0): void {
    this.pagination.update(current => ({ ...current, currentPage: page }));
    this.error.set(null);
    this.isLoading.set(true);

    this.manageAccountsService.searchUsers(
      this.filters(),
      { 
        page, 
        size: this.pagination().pageSize,
        sort: this.sort()
      }
    ).subscribe({
      next: (response: PageResponse<User>) => {
        this.users.set(response.content);
        this.pagination.set({
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          currentPage: response.number,
          pageSize: response.size
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(this.errorHandler.getErrorMessage(error));
        this.users.set([]);
        this.pagination.update(current => ({
          ...current,
          totalElements: 0,
          totalPages: 0
        }));
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.loadUsers(page);
  }

  openSearchDialog(): void {
    this.isSearchDialogOpen.set(true);
  }

  closeSearchDialog(): void {
    this.isSearchDialogOpen.set(false);
  }

  handleSearchResults(searchResult: UserSearchResult<User>): void {
    if (searchResult.results) {
      this.users.set(searchResult.results.content);
      this.searchTerm.set(searchResult.filters.fullName || '');
      this.selectedRole.set(searchResult.filters.role || null);
      
      this.pagination.set({
        totalElements: searchResult.results.totalElements,
        totalPages: searchResult.results.totalPages,
        currentPage: searchResult.results.number,
        pageSize: searchResult.results.size
      });
    }
    this.closeSearchDialog();
  }

  onUserUpdated(updatedUser: User): void {
    this.users.update(users => 
      users.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.selectedRole.set(null);
    this.loadUsers(0);
  }

  get isInSearchMode(): boolean {
    return this.searchTerm().length > 0 || !!this.selectedRole();
  }
} 