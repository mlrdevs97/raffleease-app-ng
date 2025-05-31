import { Component, Input, Output, EventEmitter, HostListener, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersSearchTabsComponent } from './orders-search-tabs/orders-search-tabs.component';
import { Order, OrderSearchFilters } from '../../../models/order.model';
import { OrdersService } from '../../../services/orders.service';
import { PageResponse } from '../../../../../core/models/pagination.model';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';

export interface SearchResult<T> {
    filters: OrderSearchFilters;
    results: PageResponse<T>;
}

@Component({
    selector: 'app-orders-search-dialog',
    standalone: true,
    imports: [
        CommonModule,
        OrdersSearchTabsComponent
    ],
    templateUrl: './orders-search-dialog.component.html',
})
export class OrdersSearchDialogComponent {
    @Input() isOpen = false;
    @Output() closeDialog = new EventEmitter<void>();
    @Output() searchResults = new EventEmitter<SearchResult<any>>();
    @ViewChild(OrdersSearchTabsComponent) searchTabsComponent?: OrdersSearchTabsComponent;
    
    searchCriteria: OrderSearchFilters = {};
    resetEvent = new EventEmitter<void>();
    isSearching = signal(false);
    errorMessage = signal<string | null>(null);
    validationError = signal<string | null>(null);
    fieldErrors = signal<Record<string, string>>({});
    hasValidCriteria = signal(false);
    validationMessages = ClientValidationMessages;

    constructor(
        private ordersService: OrdersService,
        private errorHandler: ErrorHandlerService
    ) {}
    
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
        // Reset the search criteria to an empty object
        this.searchCriteria = {};
        
        // Emit reset event to notify all child components
        this.resetEvent.emit();
        
        // Reset to first tab
        if (this.searchTabsComponent) {
            this.searchTabsComponent.activeTab = 'order';
        }
        
        // Reset all errors
        this.resetErrors();
        this.hasValidCriteria.set(false);
    }
    
    resetErrors(): void {
        this.errorMessage.set(null);
        this.validationError.set(null);
        this.fieldErrors.set({});
    }
    
    onSearch(): void {
        // Validate that we have at least one non-empty search criteria
        if (Object.keys(this.searchCriteria).length === 0) {
            this.validationError.set(this.validationMessages.search.noCriteria);
            return;
        }
        
        // Clear any previous errors
        this.resetErrors();
        this.isSearching.set(true);
        
        this.ordersService.searchOrders(this.searchCriteria).subscribe({
            next: (response: PageResponse<Order>) => {
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
    
    onCriteriaChange(criteria: OrderSearchFilters): void {
        this.searchCriteria = { ...criteria };
        // Check if we have valid criteria
        this.hasValidCriteria.set(Object.keys(this.searchCriteria).length > 0);
        // Clear validation error if we now have criteria
        if (this.hasValidCriteria()) {
            this.validationError.set(null);
        }
    }
    
    getFieldErrorMessage(field: string): string | null {
        return this.fieldErrors()[field] || null;
    }
}