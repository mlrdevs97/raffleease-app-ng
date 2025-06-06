import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, catchError, forkJoin, of } from 'rxjs';
import { ImageResponse } from '../models/image-response.model';
import { SuccessResponse } from '../../../core/models/api-response.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class RaffleImagesUploadService {
  private readonly baseUrl = `${environment.apiUrl}/associations`;
  
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  uploadImages(files: File[], raffleId?: number): Observable<SuccessResponse<ImageResponse>> {
    const associationId = this.authService.requireAssociationId();
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    // Use different endpoints based on whether we're in create or edit mode
    const endpoint = raffleId 
      ? `${this.baseUrl}/${associationId}/raffles/${raffleId}/images`  // Edit mode: raffle-specific endpoint
      : `${this.baseUrl}/${associationId}/images`;  // Create mode: general images endpoint
    
    return this.http.post<SuccessResponse<ImageResponse>>(endpoint, formData);
  }

  deleteImage(imageId: number, raffleId?: number): Observable<void> {
    const associationId = this.authService.requireAssociationId();
    
    // Use different endpoints based on whether we're in create or edit mode
    const endpoint = raffleId
      ? `${this.baseUrl}/${associationId}/raffles/${raffleId}/images/${imageId}`  // Edit mode: raffle-specific endpoint
      : `${this.baseUrl}/${associationId}/images/${imageId}`;  // Create mode: general images endpoint
    
    return this.http.delete<void>(endpoint);
  }

  deleteMultipleImages(imageIds: number[]): Observable<void[]> {
    const associationId = this.authService.requireAssociationId();
    
    if (imageIds.length === 0) {
      return of([]);
    }
    
    const deleteRequests: Observable<void>[] = imageIds.map(imageId => 
      this.http.delete<void>(`${this.baseUrl}/${associationId}/images/${imageId}`).pipe(
        catchError((error: any) => {
          console.warn(`Failed to delete image ${imageId} during cleanup:`, error);
          return EMPTY; 
        })
      )
    );
    
    return forkJoin(deleteRequests);
  }
} 