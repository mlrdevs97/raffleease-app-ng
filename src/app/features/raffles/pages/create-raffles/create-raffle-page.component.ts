import { Component } from '@angular/core';
import { RaffleFormComponent } from '../../components/create-raffles/raffle-form/raffle-form.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-raffle-page',
  standalone: true,
  imports: [RaffleFormComponent, RouterLink],
  templateUrl: './create-raffle-page.component.html'
})
export class CreateRafflePageComponent {} 