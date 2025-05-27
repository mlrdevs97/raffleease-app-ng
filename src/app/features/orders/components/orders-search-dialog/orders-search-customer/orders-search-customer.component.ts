import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders-search-customer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-search-customer.component.html',
})
export class OrdersSearchCustomerComponent {
  @Input() criteria: any = {};
  @Output() criteriaChange = new EventEmitter<any>();
  
  updateCriteria(data: any): void {
    const updatedCriteria = { ...this.criteria, ...data };
    this.criteriaChange.emit(updatedCriteria);
  }
} 