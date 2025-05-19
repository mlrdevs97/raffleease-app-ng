import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recent-orders',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './recent-orders.component.html'
})
export class RecentOrdersComponent {
  @Input() raffleId!: number;

  orders = [
    {
      id: 1001,
      date: 'May 10, 2025',
      customer: 'Jane Doe',
      amount: 30.0,
    },
    {
      id: 1002,
      date: 'May 11, 2025',
      customer: 'John Smith',
      amount: 20.0,
    },
    {
      id: 1003,
      date: 'May 12, 2025',
      customer: 'Alice Johnson',
      amount: 50.0,
    },
    {
      id: 1004,
      date: 'May 13, 2025',
      customer: 'Miguel López',
      amount: 10.0,
    },
  ];
} 