import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RaffleCardComponent } from '../raffle-card/raffle-card.component';
import { Raffle } from '../../../models/raffle.model';
@Component({
  selector: 'app-raffle-card-list',
  templateUrl: './raffle-card-list.component.html',
  standalone: true,
  imports: [CommonModule, RaffleCardComponent]
})
export class RaffleCardListComponent {
  @Input() raffles: Raffle[] = [];
} 