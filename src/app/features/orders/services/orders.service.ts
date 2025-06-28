import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, map, of, tap, throwError } from 'rxjs';
import { OrderSearchFilters, Order } from '../models/order.model';
import { AdminOrderCreate } from '../models/admin-order-create.model';
import { OrderComplete } from '../models/order-complete.model';
import { CommentRequest } from '../models/comment-request.model';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/pagination.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { RaffleStatisticsUpdateService } from '../../../core/services/raffle-statistics-update.service';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private baseUrl = `${environment.apiUrl}/associations`;
    private readonly cache = signal<Map<string, PageResponse<Order>>>(new Map());
    private readonly isLoading = signal(false);
    private readonly raffleStatisticsUpdateService = inject(RaffleStatisticsUpdateService);

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Returns a readonly signal indicating if a search request is in progress
     */
    get isLoading$() {
        return this.isLoading.asReadonly();
    }

    /**
     * Create a new order
     * @param orderData The order data
     * @returns Observable with the created order
     */
    createOrder(orderData: AdminOrderCreate): Observable<Order> {
        const associationId = this.authService.requireAssociationId();
        return this.http.post<SuccessResponse<Order>>(
            `${this.baseUrl}/${associationId}/orders`,
            orderData
        ).pipe(
            map(response => response.data!),
            tap(() => {
                this.clearCache();
            })
        );
    }

    /**
     * Search orders using filters and pagination
     * 
     * @param filters The search filters
     * @param page The page number (0-based)
     * @param size The page size
     * @param sort The sort field and direction (e.g. 'createdAt,desc')
     * @returns Observable with paged orders data
     */
    searchOrders(
        filters: OrderSearchFilters = {},
        page = 0,
        size = 10,
        sort = 'createdAt,desc'
    ): Observable<PageResponse<Order>> {
        const associationId = this.authService.requireAssociationId();
        const cacheKey = this.generateCacheKey(filters, page, size, sort);
        const cachedData = this.cache().get(cacheKey);

        if (cachedData) {
            return of(cachedData);
        }

        this.isLoading.set(true);

        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', sort);

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params = params.set(key, value.toString());
            }
        });

        return this.http.get<SuccessResponse<PageResponse<Order>>>(
            `${this.baseUrl}/${associationId}/orders`,
            { params }
        ).pipe(
            tap((response: SuccessResponse<PageResponse<Order>>) => {
                this.cache.update((cache: Map<string, PageResponse<Order>>) => {
                    const newCache = new Map(cache);
                    newCache.set(cacheKey, response.data!);
                    return newCache;
                });
            }),
            map((response: SuccessResponse<PageResponse<Order>>) => response.data!),
            finalize(() => this.isLoading.set(false))
        );
    }

    /**
     * Get a specific order by ID
     * @param orderId The order ID
     * @returns Observable with the order details
     */
    getOrder(orderId: number): Observable<Order> {
        const associationId = this.authService.requireAssociationId();

        return this.http.get<SuccessResponse<Order>>(
            `${this.baseUrl}/${associationId}/orders/${orderId}`
        ).pipe(
            map(response => response.data!)
        );
    }

    /**
     * Complete an order with payment method
     * @param orderId The order ID
     * @param orderComplete The completion data including payment method
     * @returns Observable with the updated order
     */
    completeOrder(orderId: number, orderComplete: OrderComplete): Observable<Order> {
        const associationId = this.authService.requireAssociationId();
        return this.http.put<SuccessResponse<Order>>(
            `${this.baseUrl}/${associationId}/orders/${orderId}/complete`,
            orderComplete
        ).pipe(
            map(response => response.data!),
            tap((updatedOrder: Order) => {
                this.clearCache();
                // Notify raffle statistics to update
                this.raffleStatisticsUpdateService.notifyRaffleStatisticsUpdate(updatedOrder.raffleSummary.id);
            })
        );
    }

    /**
     * Cancel an order
     * @param orderId The order ID
     * @returns Observable with the updated order
     */
    cancelOrder(orderId: number): Observable<Order> {
        const associationId = this.authService.requireAssociationId();
        return this.http.put<SuccessResponse<Order>>(
            `${this.baseUrl}/${associationId}/orders/${orderId}/cancel`,
            {}
        ).pipe(
            map(response => response.data!),
            tap((updatedOrder: Order) => {
                this.clearCache();
                // Notify raffle statistics to update
                this.raffleStatisticsUpdateService.notifyRaffleStatisticsUpdate(updatedOrder.raffleSummary.id);
            })
        );
    }

    /**
     * Set an order to unpaid status
     * @param orderId The order ID
     * @returns Observable with the updated order
     */
    setOrderUnpaid(orderId: number): Observable<Order> {
        const associationId = this.authService.requireAssociationId();
        return this.http.put<SuccessResponse<Order>>(
            `${this.baseUrl}/${associationId}/orders/${orderId}/unpaid`,
            {}
        ).pipe(
            map(response => response.data!),
            tap((updatedOrder: Order) => {
                this.clearCache();
                // Notify raffle statistics to update
                this.raffleStatisticsUpdateService.notifyRaffleStatisticsUpdate(updatedOrder.raffleSummary.id);
            })
        );
    }

    /**
     * Refund an order
     * @param orderId The order ID
     * @returns Observable with the updated order
     */
    refundOrder(orderId: number): Observable<Order> {
        const associationId = this.authService.requireAssociationId();
        return this.http.put<SuccessResponse<Order>>(
            `${this.baseUrl}/${associationId}/orders/${orderId}/refund`,
            {}
        ).pipe(
            map(response => response.data!),
            tap((updatedOrder: Order) => {
                this.clearCache();
                // Notify raffle statistics to update
                this.raffleStatisticsUpdateService.notifyRaffleStatisticsUpdate(updatedOrder.raffleSummary.id);
            })
        );
    }

    /**
     * Add a comment to an order
     * @param orderId The order ID
     * @param commentRequest The comment data
     * @returns Observable with the updated order
     */
    addComment(orderId: number, commentRequest: CommentRequest): Observable<Order> {
        const associationId = this.authService.requireAssociationId();
        return this.http.post<SuccessResponse<Order>>(
            `${this.baseUrl}/${associationId}/orders/${orderId}/comment`,
            commentRequest
        ).pipe(
            map(response => response.data!),
            tap(() => {
                this.clearCache();
            })
        );
    }

    /**
     * Edit a comment on an order
     * @param orderId The order ID
     * @param commentRequest The comment data
     * @returns Observable with the updated order
     */
    editComment(orderId: number, commentRequest: CommentRequest): Observable<Order> {
        const associationId = this.authService.requireAssociationId();
        return this.http.put<SuccessResponse<Order>>(
            `${this.baseUrl}/${associationId}/orders/${orderId}/comment`,
            commentRequest
        ).pipe(
            map(response => response.data!),
            tap(() => {
                this.clearCache();
            })
        );
    }

    /**
     * Delete a comment from an order
     * @param orderId The order ID
     * @returns Observable with void (204 No Content)
     */
    deleteComment(orderId: number): Observable<void> {
        const associationId = this.authService.requireAssociationId();
        return this.http.delete<void>(
            `${this.baseUrl}/${associationId}/orders/${orderId}/comment`
        ).pipe(
            tap(() => {
                this.clearCache();
            })
        );
    }

    clearCache(): void {
        this.cache.set(new Map());
    }

    /**
     * Generate a cache key based on search parameters
     */
    private generateCacheKey(
        filters: OrderSearchFilters,
        page: number,
        size: number,
        sort: string
    ): string {
        const parts = [
            `page=${page}`,
            `size=${size}`,
            `sort=${sort}`
        ];

        // Add non-empty filter values to the cache key
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                parts.push(`${key}=${value}`);
            }
        });

        return parts.join('&');
    }
} 