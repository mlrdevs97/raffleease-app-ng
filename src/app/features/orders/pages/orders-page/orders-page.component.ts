import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { OrdersToolbarComponent } from '../../components/orders-toolbar/orders-toolbar.component';
import { OrdersTableComponent } from '../../components/orders-table/orders-table.component';
import { OrdersSearchDialogComponent } from '../../components/orders-search-dialog/orders-search-dialog.component';
import { Order, OrderStatus, OrderSource } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { PageResponse } from '../../../../core/models/pagination.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-orders-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        OrdersToolbarComponent,
        OrdersTableComponent,
        OrdersSearchDialogComponent
    ],
    templateUrl: './orders-page.component.html',
})
export class OrdersPageComponent implements OnInit {    
    // State management with signals
    isLoading = signal<boolean>(false);
    error = signal<string | null>(null);
    orders = signal<Order[]>([]);
    pagination = signal<{
        totalElements: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    }>({
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10
    });
    
    // Search dialog state
    isSearchDialogOpen = signal<boolean>(false);

    constructor(private ordersService: OrdersService) {}
    
    // Helper method for template
    min(a: number, b: number): number {
        return Math.min(a, b);
    }
    
    ngOnInit(): void {
        this.loadOrders();
    }
    
    loadOrders(page = 0, size = 10): void {
        this.isLoading.set(true);
        this.error.set(null);
        
        this.ordersService.searchOrders({}, page, size)
            .pipe(
                catchError(error => {
                    console.error('Error loading orders:', error);
                    this.error.set('Failed to load orders. Please try again.');
                    return of({ success: false, message: 'Error', timestamp: '', data: null });
                }),
                finalize(() => {
                    this.isLoading.set(false);
                })
            )
            .subscribe(response => {
                if (response.success && response.data) {
                    this.handleOrdersResponse(response.data);
                } else {
                    this.error.set(response.message || 'Unknown error occurred');
                }
            });
    }
    
    handleOrdersResponse(pageResponse: PageResponse<Order>): void {
        this.orders.set(pageResponse.content);
        this.pagination.set({
            totalElements: pageResponse.totalElements,
            totalPages: pageResponse.totalPages,
            currentPage: pageResponse.number,
            pageSize: pageResponse.size
        });
    }
    
    onPageChange(page: number | any): void {
        // If page is an event object, extract the page number from it
        const pageNumber = typeof page === 'number' ? page : 0;
        this.loadOrders(pageNumber);
    }
    
    openSearchDialog(): void {
        this.isSearchDialogOpen.set(true);
    }
    
    closeSearchDialog(): void {
        this.isSearchDialogOpen.set(false);
    }
    
    handleSearchResults(pageResponse: PageResponse<Order>): void {
        this.handleOrdersResponse(pageResponse);
    }
}