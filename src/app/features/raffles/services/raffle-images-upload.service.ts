import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  uploadImages(files: File[]): Observable<SuccessResponse<ImageResponse>> {
    const associationId = this.authService.requireAssociationId();
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<SuccessResponse<ImageResponse>>(`${this.baseUrl}/${associationId}/images`, formData);
  }

  deleteImage(imageId: number): Observable<void> {
    const associationId = this.authService.requireAssociationId();
    return this.http.delete<void>(`${this.baseUrl}/${associationId}/images/${imageId}`);
  }
} 