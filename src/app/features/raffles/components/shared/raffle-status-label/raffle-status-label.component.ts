import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RaffleStatus } from '../../../models/raffle.model';

@Component({
  selector: 'app-raffle-status-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './raffle-status-label.component.html'
})
export class RaffleStatusLabelComponent {
  @Input() status!: RaffleStatus;

  get formattedStatus(): string {
    return this.status.charAt(0) + this.status.slice(1).toLowerCase();
  }

  get statusClasses(): Record<string, boolean> {
    return {
      'bg-green-100 text-green-800': this.status === RaffleStatus.ACTIVE,
      'bg-yellow-100 text-yellow-800': this.status === RaffleStatus.PENDING,
      'bg-blue-100 text-blue-800': this.status === RaffleStatus.PAUSED,
      'bg-gray-100 text-gray-800': this.status === RaffleStatus.COMPLETED
    };
  }
} 