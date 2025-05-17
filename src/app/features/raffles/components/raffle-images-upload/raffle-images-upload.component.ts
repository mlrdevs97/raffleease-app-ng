import { Component } from '@angular/core';

interface Image {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-raffle-images-upload',
  standalone: true,
  templateUrl: './raffle-images-upload.component.html'
})
export class RaffleImagesUploadComponent {
  images: Image[] = [];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) {
      return;
    }

    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.images.push({ file, previewUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
  }
} 