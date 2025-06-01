import { Component, signal, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { RaffleImagesUploadService } from '../../../services/raffle-images-upload.service';
import { Image } from '../../../models/image.model';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { ImageResponse } from '../../../models/image-response.model';
import { SuccessResponse } from '../../../../../core/models/api-response.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-raffle-images-upload',
  standalone: true,
  templateUrl: './raffle-images-upload.component.html'
})
export class RaffleImagesUploadComponent implements OnInit, OnChanges {
  @Input() control!: FormControl;
  @Input() fieldErrors: Record<string, string> = {};
  @Input() initialImages?: Image[];
  @Input() raffleId?: number;
  
  images: Image[] = [];
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  private draggedIndex: number | null = null;

  constructor(
    private readonly uploadService: RaffleImagesUploadService,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.initializeImages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialImages'] && this.initialImages) {
      this.initializeImages();
    }
  }

  private initializeImages(): void {
    if (this.initialImages && this.initialImages.length > 0) {
      this.images = [...this.initialImages].sort((a, b) => a.imageOrder - b.imageOrder);
      this.control.setValue(this.images);
    } else if (this.control.value && Array.isArray(this.control.value)) {
      this.images = [...this.control.value];
    }
  }

  getErrorMessage(): string | null {
    return this.errorMessage() || this.fieldErrors['images'] || null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.uploadService.uploadImages(files, this.raffleId).subscribe({
      next: (response: SuccessResponse<ImageResponse>) => {
        const newImages = response.data!.images.map((image, index) => ({
          ...image,
          imageOrder: this.images.length + index
        }));
        
        this.images = [...this.images, ...newImages];
        this.control.setValue(this.images);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
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
  
  deleteImage(index: number, imageId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.uploadService.deleteImage(imageId, this.raffleId).subscribe({
      next: () => {
        this.images.splice(index, 1);
        this.images.forEach((image, idx) => {
          image.imageOrder = idx;
        });
        this.control.setValue(this.images);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
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

    this.control.setValue(this.images);
    this.draggedIndex = null;
  }
}