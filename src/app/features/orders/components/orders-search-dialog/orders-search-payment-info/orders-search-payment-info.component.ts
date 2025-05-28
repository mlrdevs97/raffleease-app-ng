import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaymentMethods, PaymentStatus } from '../../../../../core/models/payment.model';
import { OrderSearchFilters } from '../../../models/order.model';
import { DropdownSelectComponent } from '../../../../../layout/components/dropdown-select/dropdown-select.component';

@Component({
    selector: 'app-orders-search-payment-info',
    standalone: true,
    imports: [CommonModule, DropdownSelectComponent, ReactiveFormsModule],
    templateUrl: './orders-search-payment-info.component.html',
})
export class OrdersSearchPaymentInfoComponent implements OnInit, OnChanges {
    @Input() criteria: OrderSearchFilters = {};
    @Output() criteriaChange = new EventEmitter<Partial<OrderSearchFilters>>();
    
    paymentStatusOptions = Object.values(PaymentStatus);
    paymentMethodOptions = Object.values(PaymentMethods);
    
    searchForm: FormGroup;
    
    constructor(private fb: FormBuilder) {
        this.searchForm = this.fb.group({
            paymentStatus: [''],
            paymentMethod: [''],
            minTotal: [''],
            maxTotal: ['']
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
        if (changes['criteria']) {
            // Reset form when criteria changes (especially when reset)
            this.updateFormFromCriteria();
        }
    }
    
    updateFormFromCriteria(): void {
        // Reset form when criteria is empty or update with existing values
        this.searchForm.patchValue({
            paymentStatus: this.criteria?.paymentStatus || '',
            paymentMethod: this.criteria?.paymentMethod || '',
            minTotal: this.criteria?.minTotal || '',
            maxTotal: this.criteria?.maxTotal || ''
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