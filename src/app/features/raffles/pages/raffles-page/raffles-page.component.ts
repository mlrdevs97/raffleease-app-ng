import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RafflesHeaderComponent } from '../../components/raffles/raffles-header/raffles-header.component';
import { RaffleCardListComponent } from '../../components/raffles/raffle-card-list/raffle-card-list.component';

@Component({
  selector: 'app-raffles-page',
  standalone: true,
  imports: [CommonModule, RafflesHeaderComponent, RaffleCardListComponent],
  templateUrl: './raffles-page.component.html',
})
export class RafflesPageComponent {
  raffles = [
    {
      id: 1,
      title: 'Bear Hug: Live in Concert',
      date: 'May 20, 2024',
      time: '10 PM',
      location: 'Harmony Theater, Winnipeg, MB',
      imageUrl: 'https://picsum.photos/200?random=1',
      soldTickets: 350,
      totalTickets: 500,
      ticketPrice: 25,
      startDate: 'May 1, 2024',
      endDate: 'May 20, 2024',
      status: 'active'
    },
    {
      id: 2,
      title: 'Six Fingers — DJ Set',
      date: 'Jun 2, 2024',
      time: '8 PM',
      location: 'Moonbeam Arena, Uxbridge, ON',
      imageUrl: 'https://picsum.photos/200?random=2',
      soldTickets: 72,
      totalTickets: 150,
      ticketPrice: 20,
      startDate: 'May 10, 2024',
      endDate: 'Jun 2, 2024',
      status: 'active'
    },
    {
      id: 3,
      title: 'We All Look The Same',
      date: 'Aug 5, 2024',
      time: '4 PM',
      location: 'Electric Coliseum, New York, NY',
      imageUrl: 'https://picsum.photos/200?random=3',
      soldTickets: 275,
      totalTickets: 275,
      ticketPrice: 22,
      startDate: 'Jul 1, 2024',
      endDate: 'Aug 5, 2024',
      status: 'completed'
    },
    {
      id: 4,
      title: 'Viking People',
      date: 'Dec 31, 2024',
      time: '8 PM',
      location: 'Tapestry Hall, Cambridge, ON',
      imageUrl: 'https://picsum.photos/200?random=4',
      soldTickets: 6,
      totalTickets: 40,
      ticketPrice: 30,
      startDate: 'Dec 1, 2024',
      endDate: 'Dec 31, 2024',
      status: 'paused'
    },
    {
      id: 5,
      title: 'Under the Pine',
      date: 'Jul 12, 2024',
      time: '9 PM',
      location: 'Sunlight Club, Miami, FL',
      imageUrl: 'https://picsum.photos/200?random=5',
      soldTickets: 0,
      totalTickets: 100,
      ticketPrice: 18,
      startDate: 'Jul 1, 2024',
      endDate: 'Jul 12, 2024',
      status: 'pending'
    },
    {
      id: 6,
      title: 'Classical Revival',
      date: 'Sep 10, 2024',
      time: '7 PM',
      location: 'Symphony Hall, Boston, MA',
      imageUrl: 'https://picsum.photos/200?random=6',
      soldTickets: 98,
      totalTickets: 100,
      ticketPrice: 45,
      startDate: 'Aug 1, 2024',
      endDate: 'Sep 10, 2024',
      status: 'active'
    }
  ];  
} 
