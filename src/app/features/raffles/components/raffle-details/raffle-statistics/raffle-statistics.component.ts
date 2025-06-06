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
    if (!this.raffle || !this.raffle.statistics) return;

    const {
      statistics: {
        soldTickets,
        revenue,
        averageOrderValue,
        totalOrders,
        completedOrders,
        participants,
        ticketsPerParticipant,
        dailySalesVelocity,
        firstSaleDate
      },
      totalTickets,
      startDate,
      endDate,
    } = this.raffle;

    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = new Date(endDate);

    // 1. Sales Progress 
    const ticketsSoldPercentage = totalTickets > 0 
      ? ((soldTickets / totalTickets) * 100).toFixed(1)
      : '0.0';

    // 2. Time Progress 
    let timeProgressPercentage = '0';
    let timeRemainingValue = 'N/A';
    
    if (start && end) {
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = Math.max(0, now.getTime() - start.getTime());
      timeProgressPercentage = totalDuration > 0 
        ? Math.min(100, (elapsed / totalDuration) * 100).toFixed(0)
        : '0';
      
      const timeRemainingMs = Math.max(0, end.getTime() - now.getTime());
      const timeRemainingDays = Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24));
      
      if (timeRemainingMs <= 0) {
        timeRemainingValue = 'Ended';
      } else {
        timeRemainingValue = `${timeRemainingDays} day${timeRemainingDays !== 1 ? 's' : ''} left`;
      }
    }

    // 3. Revenue Generated 
    const formattedRevenue = `€${Number(revenue).toFixed(2)}`;
    const formattedAverageOrder = `€${Number(averageOrderValue).toFixed(2)} / order`;

    // 4. Order Health 
    const orderSuccessRate = totalOrders > 0 
      ? ((completedOrders / totalOrders) * 100).toFixed(1)
      : '100.0';

    // 5. Community Reach 
    const formattedTicketsPerParticipant = `~${Number(ticketsPerParticipant).toFixed(1)} tickets / person`;

    // 6. Sales Velocity 
    const formattedVelocity = dailySalesVelocity !== null 
      ? `~${Number(dailySalesVelocity).toFixed(0)} tickets / day`
      : 'No data';
    
    let velocityContext = 'No sales data';
    if (firstSaleDate) {
      const salesDuration = Math.max(1, Math.floor((now.getTime() - new Date(firstSaleDate).getTime()) / (1000 * 60 * 60 * 24)));
      velocityContext = `Over ${salesDuration} day${salesDuration !== 1 ? 's' : ''} of sales`;
    }

    this.stats = [
      {
        label: 'Sales Progress',
        value: `${soldTickets} / ${totalTickets}`,
        delta: `${ticketsSoldPercentage}% of tickets sold`,
        isPositive: Number(ticketsSoldPercentage) > 50,
      },
      {
        label: 'Revenue Generated',
        value: formattedRevenue,
        delta: formattedAverageOrder,
        isPositive: Number(revenue) > 0,
      },
      {
        label: 'Order Health',
        value: `${completedOrders} / ${totalOrders}`,
        delta: `${orderSuccessRate}%`,
        isPositive: Number(orderSuccessRate) >= 90,
      },
      {
        label: 'Time Progress',
        value: `${timeProgressPercentage}%`,
        delta: timeRemainingValue,
        isPositive: timeRemainingValue !== 'Ended',
      },
      {
        label: 'Community Reach',
        value: `${participants} Participants`,
        delta: formattedTicketsPerParticipant,
        isPositive: participants > 0,
      },
      {
        label: 'Sales Velocity',
        value: formattedVelocity,
        delta: velocityContext,
        isPositive: dailySalesVelocity !== null && dailySalesVelocity > 0,
      }
    ];
  }
}
