import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RaffleCreate } from '../models/raffle-create.model';
import { environment } from '../../../../environments/environment';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { Raffle } from '../models/raffle.model';

@Injectable({
  providedIn: 'root'
})
export class RaffleService {
  private apiUrl = `${environment.apiUrl}/associations`;

  constructor(private http: HttpClient) {}

  createRaffle(associationId: number, raffleData: RaffleCreate): Observable<SuccessResponse<Raffle>> {
    return this.http.post<SuccessResponse<Raffle>>(`${this.apiUrl}/${associationId}/raffles`, raffleData);
  }
  
  deleteRaffle(associationId: number, raffleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${associationId}/raffles/${raffleId}`);
  }
} 