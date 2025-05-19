import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RafflesHeaderComponent } from '../../components/raffles/raffles-header/raffles-header.component';
import { RaffleCardListComponent } from '../../components/raffles/raffle-card-list/raffle-card-list.component';
import { Raffle, RaffleStatus, CompletionReason } from '../../models/raffle.model';

@Component({
  selector: 'app-raffles-page',
  standalone: true,
  imports: [CommonModule, RafflesHeaderComponent, RaffleCardListComponent],
  templateUrl: './raffles-page.component.html',
})
export class RafflesPageComponent {
  raffles: Raffle[] = [
    {
      id: 1,
      title: 'Bear Hug: Live in Concert',
      description: 'An unforgettable night of live music with Bear Hug',
      url: '/raffles/bear-hug-concert',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-05-20'),
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-04-01'),
      completedAt: null,
      status: RaffleStatus.ACTIVE,
      images: [{
        id: 1,
        fileName: 'bear-hug-concert.jpg',
        filePath: '/images/raffles/bear-hug-concert.jpg',
        contentType: 'image/jpeg',
        url: 'https://picsum.photos/200?random=1',
        imageOrder: 1
      }],
      ticketPrice: 25,
      firstTicketNumber: 1,
      availableTickets: 150,
      totalTickets: 500,
      soldTickets: 350,
      revenue: 8750,
      completionReason: null,
      winningTicketId: null
    },
    {
      id: 2,
      title: 'Six Fingers — DJ Set',
      description: 'Experience the unique sound of Six Fingers',
      url: '/raffles/six-fingers-dj',
      startDate: new Date('2024-05-10'),
      endDate: new Date('2024-06-02'),
      createdAt: new Date('2024-04-15'),
      updatedAt: new Date('2024-04-15'),
      completedAt: null,
      status: RaffleStatus.ACTIVE,
      images: [{
        id: 2,
        fileName: 'six-fingers-dj.jpg',
        filePath: '/images/raffles/six-fingers-dj.jpg',
        contentType: 'image/jpeg',
        url: 'https://picsum.photos/200?random=2',
        imageOrder: 1
      }],
      ticketPrice: 20,
      firstTicketNumber: 1,
      availableTickets: 78,
      totalTickets: 150,
      soldTickets: 72,
      revenue: 1440,
      completionReason: null,
      winningTicketId: null
    },
    {
      id: 3,
      title: 'We All Look The Same',
      description: 'A night of unity through music',
      url: '/raffles/we-all-look-the-same',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-08-05'),
      createdAt: new Date('2024-06-15'),
      updatedAt: new Date('2024-08-05'),
      completedAt: new Date('2024-08-05'),
      status: RaffleStatus.COMPLETED,
      images: [{
        id: 3,
        fileName: 'we-all-look-the-same.jpg',
        filePath: '/images/raffles/we-all-look-the-same.jpg',
        contentType: 'image/jpeg',
        url: 'https://picsum.photos/200?random=3',
        imageOrder: 1
      }],
      ticketPrice: 22,
      firstTicketNumber: 1,
      availableTickets: 0,
      totalTickets: 275,
      soldTickets: 275,
      revenue: 6050,
      completionReason: CompletionReason.ALL_TICKETS_SOLD,
      winningTicketId: 142
    },
    {
      id: 4,
      title: 'Viking People',
      description: 'A night of Nordic-inspired music',
      url: '/raffles/viking-people',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-31'),
      createdAt: new Date('2024-11-15'),
      updatedAt: new Date('2024-11-15'),
      completedAt: null,
      status: RaffleStatus.PAUSED,
      images: [{
        id: 4,
        fileName: 'viking-people.jpg',
        filePath: '/images/raffles/viking-people.jpg',
        contentType: 'image/jpeg',
        url: 'https://picsum.photos/200?random=4',
        imageOrder: 1
      }],
      ticketPrice: 30,
      firstTicketNumber: 1,
      availableTickets: 34,
      totalTickets: 40,
      soldTickets: 6,
      revenue: 180,
      completionReason: null,
      winningTicketId: null
    },
    {
      id: 5,
      title: 'Under the Pine',
      description: 'An intimate evening of acoustic music',
      url: '/raffles/under-the-pine',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-12'),
      createdAt: new Date('2024-06-20'),
      updatedAt: new Date('2024-06-20'),
      completedAt: null,
      status: RaffleStatus.PENDING,
      images: [{
        id: 5,
        fileName: 'under-the-pine.jpg',
        filePath: '/images/raffles/under-the-pine.jpg',
        contentType: 'image/jpeg',
        url: 'https://picsum.photos/200?random=5',
        imageOrder: 1
      }],
      ticketPrice: 18,
      firstTicketNumber: 1,
      availableTickets: 100,
      totalTickets: 100,
      soldTickets: 0,
      revenue: 0,
      completionReason: null,
      winningTicketId: null
    },
    {
      id: 6,
      title: 'Classical Revival',
      description: 'A modern take on classical music',
      url: '/raffles/classical-revival',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-09-10'),
      createdAt: new Date('2024-07-15'),
      updatedAt: new Date('2024-07-15'),
      completedAt: null,
      status: RaffleStatus.ACTIVE,
      images: [{
        id: 6,
        fileName: 'classical-revival.jpg',
        filePath: '/images/raffles/classical-revival.jpg',
        contentType: 'image/jpeg',
        url: 'https://picsum.photos/200?random=6',
        imageOrder: 1
      }],
      ticketPrice: 45,
      firstTicketNumber: 1,
      availableTickets: 2,
      totalTickets: 100,
      soldTickets: 98,
      revenue: 4410,
      completionReason: null,
      winningTicketId: null
    }
  ];
} 
