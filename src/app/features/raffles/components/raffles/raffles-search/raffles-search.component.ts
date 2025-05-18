import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-raffles-search',
  templateUrl: './raffles-search.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class RafflesSearchComponent {
  searchQuery = '';
} 