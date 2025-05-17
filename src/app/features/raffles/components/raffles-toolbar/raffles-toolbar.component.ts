import { Component } from '@angular/core';
import { RafflesSearchComponent } from '../raffles-search/raffles-search.component';
import { RafflesSortComponent } from '../raffles-sort/raffles-sort.component';

@Component({
  selector: 'app-raffles-toolbar',
  templateUrl: './raffles-toolbar.component.html',
  standalone: true,
  imports: [RafflesSearchComponent, RafflesSortComponent]
})
export class RafflesToolbarComponent {} 