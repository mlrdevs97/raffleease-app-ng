import { Component } from '@angular/core';
import { RaffleFormComponent } from '../../components/create-raffles/raffle-form/raffle-form.component';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';

@Component({
  selector: 'app-create-raffle-page',
  standalone: true,
  imports: [RaffleFormComponent, BackLinkComponent],
  templateUrl: './create-raffle-page.component.html'
})
export class CreateRafflePageComponent {} 