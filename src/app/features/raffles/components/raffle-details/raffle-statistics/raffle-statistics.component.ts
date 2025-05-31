import { Component, Input } from '@angular/core';
import { Raffle } from '../../../models/raffle.model';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-raffle-statistics',
  templateUrl: './raffle-statistics.component.html'
})
export class RaffleStatisticsComponent {
  @Input() raffle!: Raffle;

  stats: {
    label: string;
    value: string | number;
    delta: string;
    isPositive: boolean;
  }[] = [];

  ngOnChanges(): void {
    if (!this.raffle) return;

    const {
      soldTickets,
      totalTickets,
      ticketPrice,
      revenue,
      startDate,
      endDate,
    } = this.raffle;

    console.log(startDate, endDate);

    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = new Date(endDate);

    // Check if raffle has started (startDate exists and is in the past)
    const hasStarted = start !== null && now >= start;

    // Calculate tickets sold percentage
    const ticketsSoldPercentage = totalTickets > 0 
      ? ((soldTickets / totalTickets) * 100).toFixed(1)
      : '0.0';

    // Calculate revenue percentage
    const maxRevenue = totalTickets * Number(ticketPrice);
    const revenuePercentage = maxRevenue > 0 
      ? ((Number(revenue) / maxRevenue) * 100).toFixed(1)
      : '0.0';

    // Calculate time elapsed and remaining
    let timeElapsedValue = 'N/A';
    let timeRemainingValue = 'N/A';

    if (start === null) {
      timeElapsedValue = 'N/A';
      timeRemainingValue = '- days left';
    } else if (hasStarted) {
      // Raffle has started - calculate elapsed time
      const timeElapsedMs = now.getTime() - start.getTime();
      const timeElapsedDays = Math.floor(timeElapsedMs / (1000 * 60 * 60 * 24));
      timeElapsedValue = this.formatTimeString(timeElapsedDays);

      const timeRemainingMs = Math.max(0, end.getTime() - now.getTime());
      const timeRemainingDays = Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24));
      
      if (timeRemainingMs <= 0) {
        timeRemainingValue = 'Ended';
      } else if (timeRemainingDays > 30) {
        timeRemainingValue = '+30d left';
      } else {
        timeRemainingValue = `${timeRemainingDays}d left`;
      }
    } else {
      // Raffle hasn't started yet but has a start date
      timeElapsedValue = '-';
      
      const timeRemainingMs = Math.max(0, end.getTime() - now.getTime());
      const timeRemainingDays = Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24));
      
      if (timeRemainingDays > 30) {
        timeRemainingValue = '+30d left';
      } else {
        timeRemainingValue = `${timeRemainingDays}d left`;
      }
    }

    this.stats = [
      {
        label: 'Tickets Sold',
        value: `${soldTickets} / ${totalTickets}`,
        delta: `${ticketsSoldPercentage}% sold`,
        isPositive: true,
      },
      {
        label: 'Revenue',
        value: `€${Number(revenue).toFixed(2)}`,
        delta: `${revenuePercentage}% of goal`,
        isPositive: true,
      },
      {
        label: 'Time Elapsed',
        value: timeElapsedValue,
        delta: timeRemainingValue,
        isPositive: false,
      }
    ];
  }

  private formatTimeString(days: number): string {
    if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return remainingDays > 0 ? `${months}m, ${remainingDays}d` : `${months}m`;
    }
    return `${days}d`;
  }
}
