import { Component } from '@angular/core';
import { RaffleDetailsComponent } from '../raffle-details/raffle-details.component';
import { RaffleTicketsComponent } from '../raffle-tickets/raffle-tickets.component';
import { RaffleImagesUploadComponent } from '../raffle-images-upload/raffle-images-upload.component';

@Component({
  selector: 'app-raffle-form',
  standalone: true,
  imports: [RaffleDetailsComponent, RaffleTicketsComponent, RaffleImagesUploadComponent],
  templateUrl: './raffle-form.component.html'
})
export class RaffleFormComponent {} 