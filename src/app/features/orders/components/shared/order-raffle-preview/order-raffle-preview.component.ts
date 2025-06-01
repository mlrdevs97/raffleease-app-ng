import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../../../../core/pipes/truncate.pipe';

@Component({
  selector: 'app-order-raffle-preview',
  standalone: true,
  imports: [CommonModule, TruncatePipe],
  templateUrl: './order-raffle-preview.component.html',
})
export class OrderRafflePreviewComponent {
  @Input() imageUrl: string = '';
  @Input() eventName: string = '';
}