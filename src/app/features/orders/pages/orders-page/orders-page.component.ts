import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { OrdersToolbarComponent } from '../../components/orders-toolbar/orders-toolbar.component';
import { OrdersTableComponent } from '../../components/orders-table/orders-table.component';
import { OrdersSearchDialogComponent } from '../../components/orders-search-dialog/orders-search-dialog.component';
import { Order, OrderSearchFilters } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { PageResponse } from '../../../../core/models/pagination.model';
import { SearchResult } from '../../components/orders-search-dialog/orders-search-dialog.component';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

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
    
    isSearchDialogOpen = signal<boolean>(false);
    currentFilters = signal<OrderSearchFilters>({});

    constructor(
        private ordersService: OrdersService,
        private errorHandler: ErrorHandlerService
    ) {
        effect(() => this.isLoading.set(this.ordersService.isLoading$()));
    }
    
    min(a: number, b: number): number {
        return Math.min(a, b);
    }
    
    ngOnInit(): void {
        this.loadOrders();
    }
    
    loadOrders(page = 0, size = 10): void {
        this.resetErrors();
        this.ordersService.searchOrders(this.currentFilters(), page, size).subscribe({
            next: (response: PageResponse<Order>) => {
                this.handleOrdersResponse(response);
            },
            error: (error: unknown) => {
                console.error('Error loading orders:', error);
                this.error.set(this.errorHandler.getErrorMessage(error));
            },
            complete: () => {
                this.isLoading.set(false);
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
        const pageNumber = typeof page === 'number' ? page : 0;
        this.loadOrders(pageNumber);
    }
    
    openSearchDialog(): void {
        this.isSearchDialogOpen.set(true);
    }
    
    closeSearchDialog(): void {
        this.isSearchDialogOpen.set(false);
    }
    
    handleSearchResults(searchResult: SearchResult<Order>): void {
        this.currentFilters.set(searchResult.filters);
        this.handleOrdersResponse(searchResult.results);
    }
    
    applyFilters(filters: OrderSearchFilters): void {
        this.currentFilters.set(filters);
        this.loadOrders(0);
    }
    
    refreshOrders(): void {
        this.ordersService.clearCache();
        this.loadOrders(this.pagination().currentPage);
    }
    
    resetErrors(): void {
        this.error.set(null);
    }
}