import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders-search-dates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-search-dates.component.html',
})
export class OrdersSearchDatesComponent {
  @Input() criteria: any = {};
  @Output() criteriaChange = new EventEmitter<any>();
  
  updateCriteria(data: any): void {
    const updatedCriteria = { ...this.criteria, ...data };
    this.criteriaChange.emit(updatedCriteria);
  }
} 