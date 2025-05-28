import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderSearchFilters } from '../../../models/order.model';

@Component({
  selector: 'app-orders-search-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders-search-customer.component.html',
})
export class OrdersSearchCustomerComponent implements OnInit, OnChanges {
  @Input() criteria: OrderSearchFilters = {};
  @Output() criteriaChange = new EventEmitter<Partial<OrderSearchFilters>>();
  
  searchForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      customerName: [''],
      customerEmail: [''],
      customerPhone: ['']
    });
  }

  ngOnInit(): void {
    // Initialize form with criteria if any
    this.updateFormFromCriteria();
    
    // React to form changes
    this.searchForm.valueChanges.subscribe(formValues => {
      this.updateCriteria(formValues);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detect when criteria is reset to an empty object or changes
    if (changes['criteria']) {
      this.updateFormFromCriteria();
    }
  }

  updateFormFromCriteria(): void {
    // Reset form when criteria is empty or update with existing values
    this.searchForm.patchValue({
      customerName: this.criteria?.customerName || '',
      customerEmail: this.criteria?.customerEmail || '',
      customerPhone: this.criteria?.customerPhone || ''
    }, { emitEvent: false }); // Prevent triggering valueChanges subscription
  }
  
  updateCriteria(data: Partial<OrderSearchFilters>): void {
    // Filter out empty values
    const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key as keyof OrderSearchFilters] = value as any;
      }
      return acc;
    }, {} as Partial<OrderSearchFilters>);
    
    this.criteriaChange.emit(filteredData);
  }
} 