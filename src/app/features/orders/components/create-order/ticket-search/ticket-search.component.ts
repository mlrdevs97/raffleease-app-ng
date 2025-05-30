import { Component, ElementRef, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ticket } from '../../../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-search',
  templateUrl: './ticket-search.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class TicketSearchComponent {
  searchQuery = '';
  showSuggestions = signal(false);
  focusedIndex: number = -1;
  
  @Input() suggestions: Ticket[] = [];
  @Input() isLoading = false;
  @Input() noResults = false;
  @Input() disabled = false;
  @Input() placeholder = 'Search ticket number...';
  
  @Output() searchChange = new EventEmitter<string>();
  @Output() enterPressed = new EventEmitter<string>();
  @Output() suggestionSelected = new EventEmitter<Ticket>();
  
  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSuggestions.set(false);
      this.focusedIndex = -1;
    }
  }
  
  @HostListener('document:keydown.escape')
  onEscapePressed() {
    this.showSuggestions.set(false);
    this.focusedIndex = -1;
  }

  onInputChange() {
    this.searchChange.emit(this.searchQuery);
    
    if (this.searchQuery.trim().length >= 1) {
      this.showSuggestions.set(true);
      this.focusedIndex = -1; // Reset focus when showing new suggestions
    } else {
      this.showSuggestions.set(false);
      this.focusedIndex = -1;
    }
  }
  
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      // If a suggestion is focused, select it
      if (this.focusedIndex >= 0 && this.focusedIndex < this.suggestions.length) {
        this.selectSuggestion(this.suggestions[this.focusedIndex]);
      } else {
        // Otherwise, emit the enterPressed event
        this.enterPressed.emit(this.searchQuery);
        this.showSuggestions.set(false);
        this.focusedIndex = -1;
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      
      if (this.showSuggestions() && this.suggestions.length > 0) {
        this.focusNextSuggestion();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      
      if (this.showSuggestions() && this.suggestions.length > 0) {
        this.focusPreviousSuggestion();
      }
    }
  }
  
  selectSuggestion(ticket: Ticket) {
    this.searchQuery = ticket.ticketNumber;
    this.suggestionSelected.emit(ticket);
    this.showSuggestions.set(false);
    this.focusedIndex = -1;
  }

  /**
   * Clear the search input and hide suggestions
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.showSuggestions.set(false);
    this.focusedIndex = -1;
  }

  /**
   * Check if a suggestion is currently focused
   */
  isSuggestionFocused(index: number): boolean {
    return this.focusedIndex === index;
  }

  /**
   * Move focus to the next suggestion
   */
  private focusNextSuggestion(): void {
    if (this.suggestions.length === 0) return;

    if (this.focusedIndex === -1) {
      // No suggestion focused, focus the first suggestion
      this.focusedIndex = 0;
    } else if (this.focusedIndex < this.suggestions.length - 1) {
      this.focusedIndex++;
    } else {
      // Wrap to first suggestion
      this.focusedIndex = 0;
    }

    // Scroll the focused suggestion into view
    this.scrollFocusedSuggestionIntoView();
  }

  /**
   * Move focus to the previous suggestion
   */
  private focusPreviousSuggestion(): void {
    if (this.suggestions.length === 0) return;

    if (this.focusedIndex === -1) {
      // No suggestion focused, focus the last suggestion
      this.focusedIndex = this.suggestions.length - 1;
    } else if (this.focusedIndex > 0) {
      this.focusedIndex--;
    } else {
      // Wrap to last suggestion
      this.focusedIndex = this.suggestions.length - 1;
    }

    // Scroll the focused suggestion into view
    this.scrollFocusedSuggestionIntoView();
  }

  /**
   * Scroll the currently focused suggestion into view
   */
  private scrollFocusedSuggestionIntoView(): void {
    if (this.focusedIndex < 0) return;

      const container = this.elementRef.nativeElement.querySelector('[role="listbox"]');
      if (!container) return;

      const focusedSuggestionId = `suggestion-${this.focusedIndex}`;
      const focusedElement = document.getElementById(focusedSuggestionId);
      
      if (!focusedElement) return;

      const containerRect = container.getBoundingClientRect();
      const elementRect = focusedElement.getBoundingClientRect();

      // Calculate relative positions within the container
      const elementTop = elementRect.top - containerRect.top + container.scrollTop;
      const elementBottom = elementTop + elementRect.height;
      const containerScrollTop = container.scrollTop;
      const containerScrollBottom = containerScrollTop + container.clientHeight;

      // Check if element is above the visible area
      if (elementTop < containerScrollTop) {
        container.scrollTop = elementTop;
      }
      // Check if element is below the visible area
      else if (elementBottom > containerScrollBottom) {
        container.scrollTop = elementBottom - container.clientHeight;
      }
  }
} 