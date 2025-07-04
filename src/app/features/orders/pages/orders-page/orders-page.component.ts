import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { Order, OrderSearchFilters } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { PageResponse } from '../../../../core/models/pagination.model';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { OrdersTableComponent } from '../../components/shared/orders-table/orders-table.component';
import { OrdersSearchDialogComponent, SearchResult } from '../../components/orders/orders-search-dialog/orders-search-dialog.component';
import { OrdersToolbarComponent } from '../../components/orders/orders-toolbar/orders-toolbar.component';
import { PaginationComponent, PaginationInfo } from '../../../../shared/components/pagination/pagination.component';

@Component({
    selector: 'app-orders-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        OrdersToolbarComponent,
        OrdersTableComponent,
        OrdersSearchDialogComponent,
        PaginationComponent
    ],
    templateUrl: './orders-page.component.html',
})
export class OrdersPageComponent implements OnInit {
    isLoading = computed(() => this.ordersService.isLoading$());
    error = signal<string | null>(null);
    orders = signal<Order[]>([]);
    pagination = signal<PaginationInfo>({
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10
    });

    isSearchDialogOpen = signal<boolean>(false);
    currentFilters = signal<OrderSearchFilters>({});
    isInSearchMode = computed(() => Object.keys(this.currentFilters()).length > 0);

    constructor(
        private ordersService: OrdersService,
        private errorHandler: ErrorHandlerService,
        private route: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe((params: Params) => {
            if (params['error']) {
                this.error.set(params['error']);
                return;
            }
            this.loadOrders();
        });
    }

    loadOrders(page = 0, size = 10): void {
        if (!this.route.snapshot.queryParams['error']) {
            this.resetErrors();
        }
        this.ordersService.searchOrders(this.currentFilters(), page, size).subscribe({
            next: (response: PageResponse<Order>) => {
                this.handleOrdersResponse(response);
            },
            error: (error: unknown) => {
                this.error.set(this.errorHandler.getErrorMessage(error));
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