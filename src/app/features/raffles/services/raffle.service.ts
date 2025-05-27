import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RaffleCreate } from '../models/raffle-create.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RaffleService {
  private apiUrl = `${environment.apiUrl}/associations`;

  constructor(private http: HttpClient) {}

  createRaffle(associationId: number, raffleData: RaffleCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/${associationId}/raffles`, raffleData);
  }
  
  deleteRaffle(associationId: number, raffleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${associationId}/raffles/${raffleId}`);
  }
} 