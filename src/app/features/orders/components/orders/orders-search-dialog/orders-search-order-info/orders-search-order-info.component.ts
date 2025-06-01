import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderStatus, OrderSearchFilters } from '../../../../models/order.model';
import { DropdownSelectComponent } from '../../../../../../shared/components/dropdown-select/dropdown-select.component';
import { positiveNumberValidator } from '../../../../../../core/validators/number.validators';
import { ClientValidationMessages } from '../../../../../../core/constants/client-validation-messages';

@Component({
    selector: 'app-orders-search-order-info',
    standalone: true,
    imports: [CommonModule, DropdownSelectComponent, ReactiveFormsModule],
    templateUrl: './orders-search-order-info.component.html',
})
export class OrdersSearchOrderInfoComponent implements OnInit, OnChanges {
    @Input() criteria: OrderSearchFilters = {};
    @Input() fieldErrors: Record<string, string> = {};
    @Output() criteriaChange = new EventEmitter<Partial<OrderSearchFilters>>();
    
    orderStatusOptions = Object.values(OrderStatus); 
    
    searchForm: FormGroup;
    validationMessages = ClientValidationMessages;
    
    constructor(private fb: FormBuilder) {
        this.searchForm = this.fb.group({
            status: [''],
            orderReference: [''],
            raffleId: ['', [positiveNumberValidator()]]
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
        
        // Apply server validation errors if any
        if (changes['fieldErrors'] && this.fieldErrors) {
            this.applyFieldErrors();
        }
    }

    updateFormFromCriteria(): void {
        // Reset form when criteria is empty or update with existing values
        this.searchForm.patchValue({
            status: this.criteria?.status || '',
            orderReference: this.criteria?.orderReference || '',
            raffleId: this.criteria?.raffleId || ''
        }, { emitEvent: false }); // Prevent triggering valueChanges subscription
    }
    
    updateCriteria(data: Partial<OrderSearchFilters>): void {
        if (this.searchForm.valid) {
            const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    acc[key as keyof OrderSearchFilters] = value as any;
                }
                return acc;
            }, {} as Partial<OrderSearchFilters>);
            
            this.criteriaChange.emit(filteredData);
        }
    }
    
    applyFieldErrors(): void {
        const orderErrorFields = Object.keys(this.fieldErrors).filter(
            field => field.startsWith('order.') || field === 'raffleId'
        );
        
        orderErrorFields.forEach(fieldPath => {
            const field = fieldPath.replace('order.', '');
            const control = this.searchForm.get(field);
            if (control) {
                control.markAsTouched();
                control.setErrors({ serverError: this.fieldErrors[fieldPath] });
            }
        });
    }

    // Helper methods for the template
    getErrorMessage(controlName: string): string | null {
        const control = this.searchForm.get(controlName);
        if (!control?.touched || !control.errors) return null;
        
        // Check for server error first
        if (control.errors['serverError']) {
            return control.errors['serverError'];
        }
        
        // Check for client-side validation errors
        if (control.errors['required']) {
            return this.validationMessages.common.required;
        } else if (control.errors['positiveNumber']) {
            return this.validationMessages.number.positive;
        }
        
        return null;
    }
}