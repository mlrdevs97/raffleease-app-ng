import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderSource, OrderStatus } from '../../../models/order.model';
import { DropdownSelectComponent } from '../../../../../layout/components/dropdown-select/dropdown-select.component';

@Component({
    selector: 'app-orders-search-order-info',
    standalone: true,
    imports: [CommonModule, DropdownSelectComponent, ReactiveFormsModule],
    templateUrl: './orders-search-order-info.component.html',
})
export class OrdersSearchOrderInfoComponent implements OnInit {
    @Input() criteria: any = {};
    @Output() criteriaChange = new EventEmitter<any>();
    
    orderStatusOptions = Object.values(OrderStatus); 
    orderSourceOptions = Object.values(OrderSource);
    
    searchForm: FormGroup;
    
    constructor(private fb: FormBuilder) {
        this.searchForm = this.fb.group({
            status: [''],
            orderSource: [''],
            orderReference: ['']
        });
    }
    
    ngOnInit(): void {
        // Initialize form with criteria if any
        if (this.criteria) {
            this.searchForm.patchValue({
                status: this.criteria.status || '',
                orderSource: this.criteria.orderSource || '',
                orderReference: this.criteria.orderReference || ''
            });
        }
        
        // React to form changes
        this.searchForm.valueChanges.subscribe(formValues => {
            this.updateCriteria(formValues);
        });
    }
    
    updateCriteria(data: any): void {
        const updatedCriteria = { ...this.criteria, ...data };
        this.criteriaChange.emit(updatedCriteria);
    }
}