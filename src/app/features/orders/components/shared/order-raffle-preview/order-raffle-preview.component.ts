import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-raffle-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-raffle-preview.component.html',
})
export class OrderRafflePreviewComponent {
  @Input() imageUrl: string = '';
  @Input() eventName: string = '';
}