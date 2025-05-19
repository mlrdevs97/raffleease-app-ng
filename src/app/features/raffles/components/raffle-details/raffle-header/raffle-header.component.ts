import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RaffleStatusLabelComponent } from '../../shared/raffle-status-label/raffle-status-label.component';
import { RaffleStatus } from '../../../models/raffle.model';

@Component({
  selector: 'app-raffle-header',
  imports: [CommonModule, RaffleStatusLabelComponent],
  standalone: true,
  templateUrl: './raffle-header.component.html'
})
export class RaffleHeaderComponent {
  @Input() title!: string;
  @Input() status!: RaffleStatus;
  @Input() description!: string;
  @Input() startDate!: Date;
  @Input() endDate!: Date;
  @Input() ticketPrice!: number;
  @Input() firstTicketNumber!: number;
  @Input() totalTickets!: number;

  get formattedStatus(): string {
    return this.status.charAt(0) + this.status.slice(1).toLowerCase();
  }
} 