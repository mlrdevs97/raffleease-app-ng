import { Component, signal, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { RaffleImagesUploadService } from '../../../services/raffle-images-upload.service';
import { Image } from '../../../models/image.model';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { ImageResponse } from '../../../models/image-response.model';
import { SuccessResponse } from '../../../../../core/models/api-response.model';
import { FormControl } from '@angular/forms';
import { FileUploadLimits } from '../../../../../core/constants/file-upload';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';

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
  @Input() mode: 'create' | 'edit' = 'create';
  
  images: Image[] = [];
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  private draggedIndex: number | null = null;
  
  // Touch/mobile drag properties
  private touchStartIndex: number | null = null;
  private isDragging = false;

  constructor(
    private readonly uploadService: RaffleImagesUploadService,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  get fileUploadLimits() {
    return FileUploadLimits;
  }

  ngOnInit(): void {
    this.initializeImages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialImages'] && this.initialImages) {
      this.initializeImages();
    }
    if (changes['mode'] && this.mode === 'create') {
      this.loadUserImages();
    }
  }

  private initializeImages(): void {
    if (this.mode === 'create') {
      this.loadUserImages();
    } else if (this.mode === 'edit' && this.raffleId) {
      this.loadAndCombineImagesForEdit();
    } else if (this.control.value && Array.isArray(this.control.value)) {
      // Fallback: use existing control value
      this.images = [...this.control.value];
    }
  }

  private loadAndCombineImagesForEdit(): void {
    if (!this.raffleId) return;
    
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.uploadService.getUserImagesForRaffle(this.raffleId).subscribe({
      next: (response: SuccessResponse<ImageResponse>) => {
        const userImages = response.data?.images || [];
        const existingImages = this.initialImages || [];        
        const allImages = this.combineImages(existingImages, userImages);        
        this.images = allImages.sort((a, b) => a.imageOrder - b.imageOrder);
        this.control.setValue(this.images);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        if (this.initialImages && this.initialImages.length > 0) {
          this.images = [...this.initialImages].sort((a, b) => a.imageOrder - b.imageOrder);
          this.control.setValue(this.images);
        } else {
          this.images = [];
          this.control.setValue([]);
        }
      }
    });
  }

  /**
   * Combine existing raffle images with user's pending images, avoiding duplicates
   */
  private combineImages(existingImages: Image[], userImages: Image[]): Image[] {
    const combinedImages: Image[] = [...existingImages];
    const existingImageIds = new Set(existingImages.map(img => img.id));
    
    userImages.forEach(userImage => {
      if (!existingImageIds.has(userImage.id)) {
        const maxOrder = Math.max(0, ...combinedImages.map(img => img.imageOrder));
        combinedImages.push({
          ...userImage,
          imageOrder: userImage.imageOrder ?? (maxOrder + 1)
        });
      }
    });
    
    return combinedImages;
  }

  private loadUserImages(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.uploadService.getUserImages().subscribe({
      next: (response: SuccessResponse<ImageResponse>) => {
        console.log('User images:', response.data);
        if (response.data && response.data.images) {
          const userImages = response.data.images.map((image, index) => ({
            ...image,
            imageOrder: image.imageOrder ?? index
          }));
          
          this.images = userImages.sort((a, b) => a.imageOrder - b.imageOrder);
          this.control.setValue(this.images);
        } else {
          this.images = [];
          this.control.setValue([]);
        }
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.images = [];
        this.control.setValue([]);
      }
    });
  }

  getErrorMessage(): string | null {
    return this.errorMessage() || this.fieldErrors['images'] || null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const validation = this.validateFiles(files);
    if (!validation.isValid) {
      
      this.errorMessage.set(validation.errorMessage || ClientValidationMessages.fileUpload.validationFailed);
      input.value = '';
      return;
    }

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
        input.value = '';
      },
      error: (error: unknown) => {
        if (this.errorHandler.isValidationError(error)) {
          const validationErrors = this.errorHandler.getValidationErrors(error);
          this.errorMessage.set(validationErrors['files']);
        } else {
          this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        }
        this.isLoading.set(false);
        input.value = '';
      }
    });
  }

  private validateFiles(files: File[]): { isValid: boolean; errorMessage?: string } {
    // Check if adding these files would exceed the maximum limit
    const totalImagesAfterUpload = this.images.length + files.length;
    if (totalImagesAfterUpload > FileUploadLimits.MAX_IMAGES_PER_RAFFLE) {
      return {
        isValid: false,
        errorMessage: `You cannot upload more than ${FileUploadLimits.MAX_IMAGES_PER_RAFFLE} images per raffle. You currently have ${this.images.length} images. Please remove some images before uploading new ones.`
      };
    }

    // Check individual file sizes
    for (const file of files) {
      if (file.size > FileUploadLimits.MAX_FILE_SIZE) {
        return {
          isValid: false,
          errorMessage: ClientValidationMessages.fileUpload.fileTooLarge(file.name, FileUploadLimits.MAX_FILE_SIZE_DISPLAY)
        };
      }
    }

    // Check total request size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > FileUploadLimits.MAX_REQUEST_SIZE) {
      return {
        isValid: false,
        errorMessage: ClientValidationMessages.fileUpload.requestTooLarge(FileUploadLimits.MAX_REQUEST_SIZE_DISPLAY)
      };
    }

    // Check file types
    for (const file of files) {
      if (!FileUploadLimits.SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
        return {
          isValid: false,
          errorMessage: ClientValidationMessages.fileUpload.invalidFileType(file.name)
        };
      }
    }

    return { isValid: true };
  }
  
  deleteImage(index: number, imageId: number): void {
    if (this.isDragging) {
      return;
    }

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

  // Desktop drag and drop handlers
  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    event.dataTransfer?.setData('text/plain', index.toString());
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    this.reorderImages(this.draggedIndex, index);
    this.draggedIndex = null;
  }

  // Touch handlers for mobile devices
  onTouchStart(event: TouchEvent, index: number): void {
    event.preventDefault();
    this.touchStartIndex = index;
    this.isDragging = true;
    
    const target = event.target as HTMLElement;
    const imageContainer = target.closest('.group') as HTMLElement;
    
    if (imageContainer) {
      // Add visual feedback
      imageContainer.style.opacity = '0.7';
      imageContainer.style.transform = 'scale(1.05)';
      imageContainer.style.zIndex = '1000';
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging || this.touchStartIndex === null) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetContainer = elementBelow?.closest('.group') as HTMLElement;
    
    if (targetContainer) {
      // Find the index of the target container
      const containers = Array.from(document.querySelectorAll('.group'));
      const targetIndex = containers.indexOf(targetContainer);
      
      if (targetIndex !== -1 && targetIndex !== this.touchStartIndex) {
        // Add visual feedback to drop target
        containers.forEach(container => {
          (container as HTMLElement).style.backgroundColor = '';
        });
        targetContainer.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      }
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.isDragging || this.touchStartIndex === null) return;
    
    event.preventDefault();
    this.isDragging = false;
    
    const touch = event.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetContainer = elementBelow?.closest('.group') as HTMLElement;
    
    // Reset all visual feedback
    const containers = Array.from(document.querySelectorAll('.group'));
    containers.forEach(container => {
      const element = container as HTMLElement;
      element.style.opacity = '';
      element.style.transform = '';
      element.style.zIndex = '';
      element.style.backgroundColor = '';
    });
    
    if (targetContainer) {
      const targetIndex = containers.indexOf(targetContainer);
      if (targetIndex !== -1 && targetIndex !== this.touchStartIndex) {
        this.reorderImages(this.touchStartIndex, targetIndex);
      }
    }
    
    this.touchStartIndex = null;
  }

  // Shared reorder logic for both drag and touch
  private reorderImages(fromIndex: number | null, toIndex: number): void {
    if (fromIndex === null || fromIndex === toIndex) return;

    const draggedImage = this.images[fromIndex];
    this.images.splice(fromIndex, 1);
    this.images.splice(toIndex, 0, draggedImage);

    this.images.forEach((image, idx) => {
      image.imageOrder = idx;
    });

    this.control.setValue(this.images);
  }

  /**
   * Public method to refresh user images
   * Useful for manual refresh or after certain operations
   */
  refreshUserImages(): void {
    if (this.mode === 'create') {
      this.loadUserImages();
    } else if (this.mode === 'edit' && this.raffleId) {
      this.loadAndCombineImagesForEdit();
    }
  }
}