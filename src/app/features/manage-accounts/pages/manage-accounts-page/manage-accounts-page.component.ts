import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersListComponent } from '../../components/users-list/users-list.component';
import { UsersSearchDialogComponent, UserSearchResult } from '../../components/users-search-dialog/users-search-dialog.component';
import { ManageAccountsToolbarComponent } from '../../components/manage-accounts-toolbar/manage-accounts-toolbar.component';
import { ManageAccountsService, UserSearchFilters, SearchResult } from '../../services/manage-accounts.services';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-manage-accounts-page',
  standalone: true,
  imports: [CommonModule, UsersListComponent, UsersSearchDialogComponent, ManageAccountsToolbarComponent],
  templateUrl: './manage-accounts-page.component.html',
})
export class ManageAccountsPageComponent implements OnInit {
  private readonly manageAccountsService = inject(ManageAccountsService);
  private readonly errorHandler = inject(ErrorHandlerService);

  users = signal<User[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  isSearchDialogOpen = signal<boolean>(false);
  searchResults = signal<SearchResult<User> | null>(null);
  currentSearchFilters = signal<UserSearchFilters | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  openSearchDialog(): void {
    this.isSearchDialogOpen.set(true);
  }

  closeSearchDialog(): void {
    this.isSearchDialogOpen.set(false);
  }

  handleSearchResults(searchResult: UserSearchResult<User>): void {
    this.searchResults.set(searchResult.results);
    const content = searchResult.results?.content;
    this.users.set(Array.isArray(content) ? content : []);
    this.currentSearchFilters.set(searchResult.filters);
  }

  onUserUpdated(updatedUser: User): void {
    this.users.update(users => 
      users.map(user => user.id === updatedUser.id ? updatedUser : user)
    );

    if (this.searchResults()) {
      this.searchResults.update(results => 
        results ? {
          ...results,
          content: results.content.map(user => user.id === updatedUser.id ? updatedUser : user)
        } : null
      );
    }
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.currentSearchFilters.set(null);
    this.searchResults.set(null);

    this.manageAccountsService.searchUsers({}).subscribe({
      next: (response: SearchResult<User>) => {
        this.users.set(response.content);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(this.errorHandler.getErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  private handleSearchSubmit(filters: UserSearchFilters): void {
    this.error.set(null);
    this.manageAccountsService.searchUsers(filters, { page: 0, size: 20 }).subscribe({
      next: (result) => {
        this.handleSearchResults({
          filters,
          results: result
        });
      },
      error: (error) => {
        this.error.set(this.errorHandler.getErrorMessage(error));
      }
    });
  }

  clearSearch(): void {
    this.currentSearchFilters.set(null);
    this.searchResults.set(null);
    this.loadUsers();
  }

  get isInSearchMode(): boolean {
    return !!this.currentSearchFilters();
  }
} 