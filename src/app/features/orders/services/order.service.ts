import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { AdminOrderCreate } from '../models/admin-order-create.model';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/associations`;

  constructor(private http: HttpClient) {}

  createOrder(associationId: number, orderData: AdminOrderCreate): Observable<SuccessResponse<Order>> {
    return this.http.post<SuccessResponse<Order>>(
      `${this.apiUrl}/${associationId}/orders`, 
      orderData
    );
  }
} 