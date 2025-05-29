import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownSelectComponent } from '../../../../../layout/components/dropdown-select/dropdown-select.component';

interface SortOption {
  label: string;
  value: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-raffles-sort',
  templateUrl: './raffles-sort.component.html',
  standalone: true,
  imports: [DropdownSelectComponent, FormsModule]
})
export class RafflesSortComponent implements OnInit {
  selectedSortDisplay: string = '';
  
  sortOptions: SortOption[] = [
    { label: 'Sort by name', value: 'title', direction: 'asc' },
    { label: 'Sort by name (Z-A)', value: 'title', direction: 'desc' },
    { label: 'Sort by date (newest)', value: 'createdAt', direction: 'desc' },
    { label: 'Sort by date (oldest)', value: 'createdAt', direction: 'asc' },
    { label: 'Sort by status', value: 'status', direction: 'asc' }
  ];
  
  sortOptionLabels: string[] = [];  
  private labelToOptionMap = new Map<string, SortOption>();
  
  @Output() sortChange = new EventEmitter<{sortBy: string, sortDirection: 'asc' | 'desc'}>();
  
  ngOnInit(): void {
    this.sortOptionLabels = this.sortOptions.map(option => {
      this.labelToOptionMap.set(option.label, option);
      return option.label;
    });
    
    this.selectedSortDisplay = this.sortOptionLabels[0];
  }
  
  onSortChange(selectedLabel: string): void {
    const selectedOption = this.labelToOptionMap.get(selectedLabel);
    if (selectedOption) {
      this.sortChange.emit({
        sortBy: selectedOption.value,
        sortDirection: selectedOption.direction
      });
    }
  }
} 