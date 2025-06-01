import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RaffleCreate } from '../models/raffle-create.model';
import { RaffleEdit } from '../models/raffle-edit.model';
import { RaffleStatusUpdate } from '../models/raffle-status-update.model';
import { environment } from '../../../../environments/environment';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { Raffle } from '../models/raffle.model';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RaffleService {
  private apiUrl = `${environment.apiUrl}/associations`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  createRaffle(raffleData: RaffleCreate): Observable<SuccessResponse<Raffle>> {
    const associationId = this.authService.requireAssociationId();
    return this.http.post<SuccessResponse<Raffle>>(`${this.apiUrl}/${associationId}/raffles`, raffleData);
  }

  editRaffle(raffleId: number, raffleData: RaffleEdit): Observable<SuccessResponse<Raffle>> {
    const associationId = this.authService.requireAssociationId();
    return this.http.put<SuccessResponse<Raffle>>(`${this.apiUrl}/${associationId}/raffles/${raffleId}`, raffleData);
  }
  
  updateRaffleStatus(raffleId: number, statusUpdate: RaffleStatusUpdate): Observable<SuccessResponse<Raffle>> {
    const associationId = this.authService.requireAssociationId();
    return this.http.patch<SuccessResponse<Raffle>>(`${this.apiUrl}/${associationId}/raffles/${raffleId}/status`, statusUpdate);
  }
  
  deleteRaffle(raffleId: number): Observable<void> {
    const associationId = this.authService.requireAssociationId();
    return this.http.delete<void>(`${this.apiUrl}/${associationId}/raffles/${raffleId}`);
  }
} 