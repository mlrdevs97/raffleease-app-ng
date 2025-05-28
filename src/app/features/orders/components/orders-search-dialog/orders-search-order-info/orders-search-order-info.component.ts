import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderSource, OrderStatus, OrderSearchFilters } from '../../../models/order.model';
import { DropdownSelectComponent } from '../../../../../layout/components/dropdown-select/dropdown-select.component';

@Component({
    selector: 'app-orders-search-order-info',
    standalone: true,
    imports: [CommonModule, DropdownSelectComponent, ReactiveFormsModule],
    templateUrl: './orders-search-order-info.component.html',
})
export class OrdersSearchOrderInfoComponent implements OnInit, OnChanges {
    @Input() criteria: OrderSearchFilters = {};
    @Output() criteriaChange = new EventEmitter<Partial<OrderSearchFilters>>();
    
    orderStatusOptions = Object.values(OrderStatus); 
    orderSourceOptions = Object.values(OrderSource);
    
    searchForm: FormGroup;
    
    constructor(private fb: FormBuilder) {
        this.searchForm = this.fb.group({
            status: [''],
            orderSource: [''],
            orderReference: [''],
            raffleId: ['']
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
        // Detect when criteria is reset to an empty object
        if (changes['criteria']) {
            this.updateFormFromCriteria();
        }
    }

    updateFormFromCriteria(): void {
        // Reset form when criteria is empty or update with existing values
        this.searchForm.patchValue({
            status: this.criteria?.status || '',
            orderSource: this.criteria?.orderSource || '',
            orderReference: this.criteria?.orderReference || '',
            raffleId: this.criteria?.raffleId || ''
        }, { emitEvent: false }); // Prevent triggering valueChanges subscription
    }
    
    updateCriteria(data: Partial<OrderSearchFilters>): void {
        // Filter out empty values
        const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                // Cast the key to keyof OrderSearchFilters to ensure type safety
                acc[key as keyof OrderSearchFilters] = value as any;
            }
            return acc;
        }, {} as Partial<OrderSearchFilters>);
        
        this.criteriaChange.emit(filteredData);
    }
}