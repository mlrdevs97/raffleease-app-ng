import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RafflesSearchComponent } from '../raffles-search/raffles-search.component';
import { RafflesSortComponent } from '../raffles-sort/raffles-sort.component';
import { RafflesStatusComponent } from '../raffles-status/raffles-status.component';
import { Raffle } from '../../../models/raffle.model';

@Component({
  selector: 'app-raffles-toolbar',
  templateUrl: './raffles-toolbar.component.html',
  standalone: true,
  imports: [RafflesSearchComponent, RafflesSortComponent, RafflesStatusComponent]
})
export class RafflesToolbarComponent {
  @Output() searchChange = new EventEmitter<string>();
  @Output() enterPressed = new EventEmitter<string>();
  @Output() suggestionSelected = new EventEmitter<Raffle>();
  @Output() statusChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<{sortBy: string, sortDirection: 'asc' | 'desc'}>();
  
  @Input() suggestions: Raffle[] = [];
  @Input() isSearchLoading = false;
  @Input() noSearchResults = false;
  
  onSearchChange(searchTerm: string): void {
    this.searchChange.emit(searchTerm);
  }
  
  onEnterPressed(searchTerm: string): void {
    this.enterPressed.emit(searchTerm);
  }
  
  onSuggestionSelected(raffle: Raffle): void {
    this.suggestionSelected.emit(raffle);
  }
  
  onStatusChange(status: string): void {
    this.statusChange.emit(status);
  }
  
  onSortChange(sortData: {sortBy: string, sortDirection: 'asc' | 'desc'}): void {
    this.sortChange.emit(sortData);
  }
} 