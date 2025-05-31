import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/pagination.model';
import { Ticket, TicketSearchFilters } from '../../../core/models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketQueryService {
  private readonly apiUrl = `${environment.apiUrl}/associations`;
  private readonly isLoading = signal(false);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  get isLoading$() {
    return this.isLoading.asReadonly();
  }

  getById(raffleId: number, ticketId: number): Observable<Ticket> {
    const associationId = this.authService.requireAssociationId();

    return this.http.get<SuccessResponse<Ticket>>(
      `${this.apiUrl}/${associationId}/raffles/${raffleId}/tickets/${ticketId}`
    ).pipe(
      map(response => response.data!)
    );
  }

  search(
    raffleId: number,
    filters: TicketSearchFilters = {},
    page: number = 0,
    size: number = 10,
    sort: string = 'ticketNumber,asc'
  ): Observable<PageResponse<Ticket>> {
    const associationId = this.authService.requireAssociationId();
    
    this.isLoading.set(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    // Add search filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'string') {
          params = params.set(key, value.trim());
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    return this.http.get<SuccessResponse<PageResponse<Ticket>>>(
      `${this.apiUrl}/${associationId}/raffles/${raffleId}/tickets`,
      { params }
    ).pipe(
      tap(() => {
        this.isLoading.set(false);
      }),
      map(response => response.data!),
      tap({
        error: () => {
          this.isLoading.set(false);
        }
      })
    );
  }
} 