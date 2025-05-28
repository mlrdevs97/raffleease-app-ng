import { Component, Input, Output, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersSearchTabsComponent } from './orders-search-tabs/orders-search-tabs.component';
import { OrderSearchFilters } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { PageResponse } from '../../../../core/models/pagination.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

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
    @Input() associationId!: number; // Still kept for backward compatibility but not used
    @Output() closeDialog = new EventEmitter<void>();
    @Output() searchResults = new EventEmitter<PageResponse<any>>();
    @ViewChild(OrdersSearchTabsComponent) searchTabsComponent?: OrdersSearchTabsComponent;
    
    searchCriteria: OrderSearchFilters = {};
    resetEvent = new EventEmitter<void>();
    isSearching = false;
    searchError: string | null = null;

    constructor(private ordersService: OrdersService) {}
    
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
        
        // Clear any previous errors
        this.searchError = null;
    }
    
    onSearch(): void {
        this.isSearching = true;
        this.searchError = null;
        
        this.ordersService.searchOrders(this.searchCriteria)
            .pipe(
                catchError(error => {
                    console.error('Error searching orders:', error);
                    this.searchError = 'Failed to search orders. Please try again.';
                    return of({ success: false, message: 'Error', timestamp: '', data: null });
                }),
                finalize(() => {
                    this.isSearching = false;
                })
            )
            .subscribe(response => {
                if (response.success && response.data) {
                    this.searchResults.emit(response.data);
                    this.closeDialog.emit();
                } else {
                    this.searchError = response.message || 'Unknown error occurred';
                }
            });
    }
    
    onCriteriaChange(criteria: OrderSearchFilters): void {
        this.searchCriteria = { ...criteria };
    }
}