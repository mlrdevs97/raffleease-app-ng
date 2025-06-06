import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaymentMethod } from '../../../../../../core/models/payment.model';
import { OrderSearchFilters } from '../../../../models/order.model';
import { DropdownSelectComponent } from '../../../../../../shared/components/dropdown-select/dropdown-select.component';
import { nonNegativeNumberValidator, minMaxValidator } from '../../../../../../core/validators/number.validators';
import { ClientValidationMessages } from '../../../../../../core/constants/client-validation-messages';

@Component({
    selector: 'app-orders-search-payment-info',
    standalone: true,
    imports: [CommonModule, DropdownSelectComponent, ReactiveFormsModule],
    templateUrl: './orders-search-payment-info.component.html',
})
export class OrdersSearchPaymentInfoComponent implements OnInit, OnChanges {
    @Input() criteria: OrderSearchFilters = {};
    @Input() fieldErrors: Record<string, string> = {};
    @Output() criteriaChange = new EventEmitter<Partial<OrderSearchFilters>>();
    
    paymentMethodOptions = Object.values(PaymentMethod);
    
    searchForm: FormGroup;
    validationMessages = ClientValidationMessages;
    
    constructor(private fb: FormBuilder) {
        this.searchForm = this.fb.group({
            paymentMethod: [''],
            minTotal: ['', [nonNegativeNumberValidator()]],
            maxTotal: ['', [nonNegativeNumberValidator()]]
        }, { validators: minMaxValidator('minTotal', 'maxTotal') });
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
            this.updateFormFromCriteria();
        }
        
        if (changes['fieldErrors'] && this.fieldErrors) {
            this.applyFieldErrors();
        }
    }
    
    updateFormFromCriteria(): void {
        // Reset form when criteria is empty or update with existing values
        this.searchForm.patchValue({
            paymentMethod: this.criteria?.paymentMethod || '',
            minTotal: this.criteria?.minTotal || '',
            maxTotal: this.criteria?.maxTotal || ''
        }, { emitEvent: false }); // Prevent triggering valueChanges subscription
    }
    
    updateCriteria(data: Partial<OrderSearchFilters>): void {
        // Only proceed if the form is valid
        if (this.searchForm.valid) {
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
    
    applyFieldErrors(): void {
        const paymentErrorFields = Object.keys(this.fieldErrors).filter(
            field => field.startsWith('payment.') || field.includes('Total') || field === 'paymentMethod'
        );
        
        paymentErrorFields.forEach(fieldPath => {
            const field = fieldPath.replace('payment.', '');
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
        } else if (control.errors['nonNegative']) {
            return this.validationMessages.number.nonNegative;
        }
        
        return null;
    }
    
    getFormErrorMessage(): string | null {
        if (this.searchForm.touched && this.searchForm.errors) {
            if (this.searchForm.errors['minGreaterThanMax']) {
                return this.validationMessages.number.minGreaterThanMax;
            }
        }
        return null;
    }
}