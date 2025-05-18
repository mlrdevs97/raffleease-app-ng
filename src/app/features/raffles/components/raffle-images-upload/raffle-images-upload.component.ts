import { Component, inject, signal } from '@angular/core';
import { RaffleImagesUploadService } from '../../services/raffle-images-upload.service';
import { ImageDTO } from '../../models/image-dto.model';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ImageResponse } from '../../models/image-response.model';
import { SuccessResponse } from '../../../../core/models/api-response.model';

@Component({
  selector: 'app-raffle-images-upload',
  standalone: true,
  templateUrl: './raffle-images-upload.component.html'
})
export class RaffleImagesUploadComponent {
  images: ImageDTO[] = [];
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly uploadService: RaffleImagesUploadService,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const associationId = this.authService.getAssociationId();
    if (!associationId) {
      this.authService.logout();
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.uploadService.uploadImages(associationId, files).subscribe({
      next: (response: SuccessResponse<ImageResponse>) => {
        this.images = [...this.images, ...response.data!.images];
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.log(error);
        if (this.errorHandler.isValidationError(error)) {
          const validationErrors = this.errorHandler.getValidationErrors(error);
          console.log(validationErrors);
          this.errorMessage.set(validationErrors['files']);
        } else {
          this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        }
        this.isLoading.set(false);
      }
    });
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
  }
}