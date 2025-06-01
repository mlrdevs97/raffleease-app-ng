import { Component, Input, signal } from '@angular/core';
import { Image } from '../../../models/image.model';

@Component({
  selector: 'app-raffle-gallery',
  standalone: true,
  templateUrl: './raffle-gallery.component.html'
})
export class RaffleGalleryComponent {
  @Input() images!: Image[];
  
  selectedImageIndex = signal(0);

  get selectedImage(): Image {
    return this.images[this.selectedImageIndex()] || this.images[0];
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  isSelected(index: number): boolean {
    return this.selectedImageIndex() === index;
  }
} 