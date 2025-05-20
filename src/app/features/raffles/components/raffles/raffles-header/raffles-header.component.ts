import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RafflesToolbarComponent } from '../raffles-toolbar/raffles-toolbar.component';
import { RouterLink } from '@angular/router';
import { Raffle } from '../../../models/raffle.model';

@Component({
    standalone: true,
    imports: [RafflesToolbarComponent, RouterLink],
    selector: 'app-raffles-header',
    templateUrl: './raffles-header.component.html',
})
export class RafflesHeaderComponent {
    @Input() suggestions: Raffle[] = [];
    @Input() isSearchLoading = false;
    @Input() noSearchResults = false;

    @Output() searchChange = new EventEmitter<string>();
    @Output() enterPressed = new EventEmitter<string>();
    @Output() suggestionSelected = new EventEmitter<Raffle>();
    @Output() statusChange = new EventEmitter<string>();
    @Output() sortChange = new EventEmitter<{sortBy: string, sortDirection: 'asc' | 'desc'}>();

    onSearchChange(term: string): void {
        this.searchChange.emit(term);
    }

    onEnterPressed(term: string): void {
        this.enterPressed.emit(term);
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