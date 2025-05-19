import { Component } from '@angular/core';
import { RaffleStatisticsComponent } from '../../components/raffle-details/raffle-statistics/raffle-statistics.component';
import { BackLinkComponent } from '../../components/raffle-details/back-link/back-link.component';
import { RaffleGalleryComponent } from '../../components/raffle-details/raffle-gallery/raffle-gallery.component';
import { RaffleHeaderComponent } from '../../components/raffle-details/raffle-header/raffle-header.component';
import { RecentOrdersComponent } from '../../components/raffle-details/recent-orders/recent-orders.component';
import { Raffle, RaffleStatus } from '../../models/raffle.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-raffle-details-page',
  standalone: true,
  imports: [
    CommonModule,
    BackLinkComponent, 
    RaffleGalleryComponent, 
    RaffleHeaderComponent, 
    RecentOrdersComponent,
    RaffleStatisticsComponent
  ],
  templateUrl: './raffle-details-page.component.html'
})
export class RaffleDetailsPageComponent {
  raffle: Raffle = {
    id: 1,
    title: 'Raffle 1',
    description: 'Description 1',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2025-06-02'),
    ticketPrice: 10,
    firstTicketNumber: 1,
    totalTickets: 100,
    revenue: 900,
    soldTickets: 90,
    images: [
      {
        id: 1,
        url: 'https://picsum.photos/200/300',
        fileName: 'image.jpg',
        filePath: '//via.placeholder.com/150',
        contentType: 'image/jpeg',
        imageOrder: 1,
      }
    ],
    url: 'https://www.google.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    status: RaffleStatus.ACTIVE,
    completionReason: null,
    availableTickets: 100,
    winningTicketId: null,
  };

  get timePassed(): string {
    const start = new Date(this.raffle.startDate);
    const now = new Date();
    const diff = Math.max(0, Math.floor((+now - +start) / (1000 * 60 * 60 * 24)));
    return `${diff} day${diff !== 1 ? 's' : ''}`;
  }

  ngOnInit(): void {
    console.log(this.raffle);
  }
} 