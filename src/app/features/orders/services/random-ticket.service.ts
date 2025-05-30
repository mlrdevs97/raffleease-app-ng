import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { Ticket } from '../../../core/models/ticket.model';
import { SuccessResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class RandomTicketService {
  private readonly apiUrl = `${environment.apiUrl}/associations`;
  private isLoading = signal(false);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get random tickets from the backend API
   */
  getRandomTickets(raffleId: number, quantity: number): Observable<Ticket[]> {
    const associationId = this.authService.getAssociationId();
    this.isLoading.set(true);

    return this.http.get<SuccessResponse<Ticket[]>>(
      `${this.apiUrl}/${associationId}/raffles/${raffleId}/tickets/random`,
      {
        params: { quantity: quantity.toString() }
      }
    ).pipe(
      map(response => response.data!),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Get the loading state as a readonly signal
   */
  getIsLoading() {
    return this.isLoading.asReadonly();
  }
} 