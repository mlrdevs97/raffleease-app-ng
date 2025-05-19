import { Component } from '@angular/core';
import { RafflesSearchComponent } from '../raffles-search/raffles-search.component';
import { RafflesSortComponent } from '../raffles-sort/raffles-sort.component';
import { RafflesStatusComponent } from '../raffles-status/raffles-status.component';

@Component({
  selector: 'app-raffles-toolbar',
  templateUrl: './raffles-toolbar.component.html',
  standalone: true,
  imports: [RafflesSearchComponent, RafflesSortComponent, RafflesStatusComponent]
})
export class RafflesToolbarComponent {
  onStatusChange(status: string): void {
    // TODO: Implement filtering logic based on selected status
    // # Reason: Placeholder for status filter integration
  }
} 