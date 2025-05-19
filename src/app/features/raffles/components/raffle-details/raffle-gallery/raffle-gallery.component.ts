import { Component, Input } from '@angular/core';
import { Image } from '../../../models/image.model';

@Component({
  selector: 'app-raffle-gallery',
  standalone: true,
  templateUrl: './raffle-gallery.component.html'
})
export class RaffleGalleryComponent {
  @Input() images!: Image[];
} 