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
      availableTickets,
      totalTickets,
      ticketPrice,
      revenue,
      startDate,
      endDate,
    } = this.raffle;

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    const totalGoal = totalTickets * Number(ticketPrice);
    const revenueRemaining = totalGoal - Number(revenue);
    const revenueDelta = revenueRemaining <= 0
      ? `Goal reached`
      : `€${revenueRemaining} left`;

    const timeElapsedPercent = Math.min(
      100,
      ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100
    );
    const timeRemainingPercent = 100 - timeElapsedPercent;
    const timeRemaining = Math.max(0, timeRemainingPercent).toFixed(0) + '% left';

    this.stats = [
      {
        label: 'Tickets Sold',
        value: soldTickets,
        delta: `${availableTickets} available`,
        isPositive: true,
      },
      {
        label: 'Revenue',
        value: `€${revenue}`,
        delta: revenueDelta,
        isPositive: true,
      },
      {
        label: 'Time Elapsed',
        value: `${timeElapsedPercent.toFixed(0)}%`,
        delta: timeRemaining,
        isPositive: false,
      }
    ];
  }
}
