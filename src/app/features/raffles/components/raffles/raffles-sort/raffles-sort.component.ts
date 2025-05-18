import { Component, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-raffles-sort',
  templateUrl: './raffles-sort.component.html',
  standalone: true
})
export class RafflesSortComponent {
  isOpen = false;
  selectedSortOption = 'Sort by name';
  
  sortOptions = [
    'Sort by name',
    'Sort by Date',
    'Sort by status'
  ];
  
  constructor(private elementRef: ElementRef) {}
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
  
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }
  
  selectOption(option: string) {
    this.selectedSortOption = option;
    this.isOpen = false;
  }
} 