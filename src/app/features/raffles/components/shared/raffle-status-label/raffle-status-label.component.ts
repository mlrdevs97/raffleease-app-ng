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
      'bg-lime-400/20 text-lime-700': this.status === RaffleStatus.ACTIVE,
      'bg-amber-400/20 text-amber-700': this.status === RaffleStatus.PENDING,
      'bg-zinc-400/20 text-zinc-700': this.status === RaffleStatus.PAUSED,
      'bg-blue-400/20 text-blue-700': this.status === RaffleStatus.COMPLETED
    };
  }
} 