import { Component, ElementRef, EventEmitter, HostListener, Output, signal } from '@angular/core';

interface SortOption {
  label: string;
  value: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-raffles-sort',
  templateUrl: './raffles-sort.component.html',
  standalone: true
})
export class RafflesSortComponent {
  isOpen = signal(false);
  selectedSortOption = signal<SortOption>({
    label: 'Sort by name',
    value: 'title',
    direction: 'asc'
  });
  
  sortOptions: SortOption[] = [
    { label: 'Sort by name', value: 'title', direction: 'asc' },
    { label: 'Sort by name (Z-A)', value: 'title', direction: 'desc' },
    { label: 'Sort by date (newest)', value: 'createdAt', direction: 'desc' },
    { label: 'Sort by date (oldest)', value: 'createdAt', direction: 'asc' },
    { label: 'Sort by status', value: 'status', direction: 'asc' }
  ];
  
  @Output() sortChange = new EventEmitter<{sortBy: string, sortDirection: 'asc' | 'desc'}>();
  
  constructor(private elementRef: ElementRef) {}
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
  
  toggleDropdown() {
    this.isOpen.update(state => !state);
  }
  
  selectOption(option: SortOption) {
    this.selectedSortOption.set(option);
    this.sortChange.emit({
      sortBy: option.value,
      sortDirection: option.direction
    });
    this.isOpen.set(false);
  }
} 