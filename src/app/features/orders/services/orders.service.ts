import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderSearchFilters, Order } from '../models/order.model';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/pagination.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private baseUrl = `${environment.apiUrl}/admin/api/v1/associations`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }


    /**
     * Search orders using filters and pagination
     * @param filters The search filters
     * @param page The page number (0-based)
     * @param size The page size
     * @param sort The sort field and direction (e.g. 'createdAt,desc')
     * @returns Observable with paged orders data
     */
    searchOrders(
        filters: OrderSearchFilters,
        page = 0,
        size = 10,
        sort = 'createdAt,desc'
    ): Observable<SuccessResponse<PageResponse<Order>>> {
        // Convert filters to HttpParams
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
        );
    }

    /**
     * Get a specific order by ID
     * @param orderId The order ID
     * @returns Observable with the order details
     */
    getOrder(orderId: number): Observable<SuccessResponse<Order>> {
        return this.http.get<SuccessResponse<Order>>(
            `${this.baseUrl}/${this.getAssociationId()}/orders/${orderId}`
        );
    }

    private getAssociationId(): number {
        const associationId = this.authService.getAssociationId();
        if (!associationId) {
            throw new Error('Association ID not found');
        }
        return associationId;
    }
} 