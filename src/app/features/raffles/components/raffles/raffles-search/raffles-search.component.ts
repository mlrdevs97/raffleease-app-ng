import { Component, ElementRef, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { Raffle } from '../../../models/raffle.model';

@Component({
  selector: 'app-raffles-search',
  templateUrl: './raffles-search.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class RafflesSearchComponent {
  searchQuery = '';
  private searchSubject = new Subject<string>();
  showSuggestions = signal(false);
  
  @Input() suggestions: Raffle[] = [];
  @Input() isLoading = false;
  @Input() noResults = false;
  
  @Output() searchChange = new EventEmitter<string>();
  @Output() enterPressed = new EventEmitter<string>();
  @Output() suggestionSelected = new EventEmitter<Raffle>();
  
  constructor(private elementRef: ElementRef) {
    this.searchSubject.pipe(
      filter(term => term.trim().length >= 2 || term.trim().length === 0),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchChange.emit(term);
      
      if (term.trim().length >= 2) {
        this.showSuggestions.set(true);
      } else {
        this.showSuggestions.set(false);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSuggestions.set(false);
    }
  }
  
  @HostListener('document:keydown.escape')
  onEscapePressed() {
    this.showSuggestions.set(false);
  }

  onInputChange() {
    this.searchSubject.next(this.searchQuery);
  }
  
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.enterPressed.emit(this.searchQuery);
      this.showSuggestions.set(false);
    }
  }
  
  selectSuggestion(raffle: Raffle) {
    this.searchQuery = raffle.title;
    this.suggestionSelected.emit(raffle);
    this.showSuggestions.set(false);
  }
} 