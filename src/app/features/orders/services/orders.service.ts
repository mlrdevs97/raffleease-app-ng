import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, map, of, tap } from 'rxjs';
import { OrderSearchFilters, Order } from '../models/order.model';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/pagination.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private baseUrl = `${environment.apiUrl}/associations`;
    private readonly cache = signal<Map<string, PageResponse<Order>>>(new Map());
    private readonly isLoading = signal(false);

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

        // Add all non-empty filters to params
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params = params.set(key, value.toString());
            }
        });

        return this.http.get<SuccessResponse<PageResponse<Order>>>(
            `${this.baseUrl}/${this.getAssociationId()}/orders`,
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
        return this.http.get<SuccessResponse<Order>>(
            `${this.baseUrl}/${this.getAssociationId()}/orders/${orderId}`
        ).pipe(
            map(response => response.data!)
        );
    }

    /**
     * Clear the search cache, forcing the next search to fetch fresh data
     */
    clearCache(): void {
        this.cache.set(new Map());
    }

    /**
     * Get the current association ID
     */
    private getAssociationId(): number {
        const associationId = this.authService.getAssociationId();
        if (!associationId) {
            throw new Error('Association ID not found');
        }
        return associationId;
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