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
  private draggedIndex: number | null = null;

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

  deleteImage(index: number, imageId: number): void {
    const associationId = this.authService.getAssociationId();
    if (!associationId) {
      this.authService.logout();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.uploadService.deleteImage(associationId, imageId).subscribe({
      next: () => {
        this.images.splice(index, 1);
        // Update imageOrder for each image based on its new index
        this.images.forEach((image, idx) => {
          image.imageOrder = idx;
        });
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.log(error);
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    event.dataTransfer?.setData('text/plain', index.toString());
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    const draggedIndex = this.draggedIndex;
    if (draggedIndex === null || draggedIndex === index) return;

    const draggedImage = this.images[draggedIndex];
    this.images.splice(draggedIndex, 1);
    this.images.splice(index, 0, draggedImage);

    this.images.forEach((image, idx) => {
      image.imageOrder = idx;
    });

    this.draggedIndex = null;
  }
}