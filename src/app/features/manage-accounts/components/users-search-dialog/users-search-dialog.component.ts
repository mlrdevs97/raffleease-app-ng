import { Component, Input, Output, EventEmitter, HostListener, signal, inject, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/models/user.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { UsersSearchFormComponent } from '../users-search-form/users-search-form.component';
import { ManageAccountsService, UserSearchFilters, SearchResult } from '../../services/manage-accounts.services';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ClientValidationMessages } from '../../../../core/constants/client-validation-messages';

export interface UserSearchResult<T> {
  filters: UserSearchFilters;
  results: SearchResult<T>;
}

@Component({
  selector: 'app-users-search-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent, UsersSearchFormComponent],
  templateUrl: './users-search-dialog.component.html',
})
export class UsersSearchDialogComponent implements OnChanges {
  private readonly manageAccountsService = inject(ManageAccountsService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() isOpen = false;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() searchResults = new EventEmitter<UserSearchResult<User>>();

  searchCriteria: UserSearchFilters = {};
  resetEvent = new EventEmitter<void>();
  isSearching = signal(false);
  errorMessage = signal<string | null>(null);
  validationError = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  validationMessages = ClientValidationMessages;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.resetDialog();
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent): void {
    if (this.isOpen) {
      this.onClose();
    }
  }

  onClose(): void {
    this.closeDialog.emit();
  }

  onReset(): void {
    this.searchCriteria = {};
    this.resetEvent.emit();
    this.resetErrors();
  }

  resetDialog(): void {
    this.searchCriteria = {};
    this.resetErrors();
    this.isSearching.set(false);
  }

  resetErrors(): void {
    this.errorMessage.set(null);
    this.validationError.set(null);
    this.fieldErrors.set({});
  }

  onSearchSubmit(criteria: UserSearchFilters): void {
    this.searchCriteria = { ...criteria };
    this.resetErrors();
    this.isSearching.set(true);
    
    this.manageAccountsService.searchUsers(this.searchCriteria, { page: 0, size: 20 }).subscribe({
      next: (response: SearchResult<User>) => {
        this.searchResults.emit({
          filters: { ...this.searchCriteria },
          results: response
        });
        this.closeDialog.emit();
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        if (this.errorHandler.isValidationError(error)) {
          const validationErrors = this.errorHandler.getValidationErrors(error);
          this.applyFieldErrors(validationErrors);
        }
      },
      complete: () => {
        this.isSearching.set(false);
      }
    });
  }

  applyFieldErrors(errors: Record<string, string>): void {
    this.fieldErrors.set(errors);
  }

  getFieldErrorMessage(field: string): string | null {
    return this.fieldErrors()[field] || null;
  }
}