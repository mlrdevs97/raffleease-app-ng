import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderSearchFilters } from '../../../models/order.model';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';

@Component({
  selector: 'app-orders-search-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders-search-customer.component.html',
})
export class OrdersSearchCustomerComponent implements OnInit, OnChanges {
  @Input() criteria: OrderSearchFilters = {};
  @Input() fieldErrors: Record<string, string> = {};
  @Output() criteriaChange = new EventEmitter<Partial<OrderSearchFilters>>();
  
  searchForm: FormGroup;
  validationMessages = ClientValidationMessages;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      customerName: ['', [Validators.maxLength(100)]],
      customerEmail: ['', [Validators.maxLength(100), Validators.email]],
      customerPhone: ['', [Validators.maxLength(30)]]
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
    
    // Apply server validation errors if any
    if (changes['fieldErrors'] && this.fieldErrors) {
      this.applyFieldErrors();
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
    const customerErrorFields = Object.keys(this.fieldErrors).filter(
      field => field.startsWith('customer.')
    );
    
    customerErrorFields.forEach(fieldPath => {
      const field = fieldPath.replace('customer.', '');
      const control = this.searchForm.get(field);
      if (control) {
        control.markAsTouched();
        control.setErrors({ serverError: this.fieldErrors[fieldPath] });
      }
    });
  }
  
  // Get error message for a field
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
    } else if (control.errors['maxlength']) {
      return this.validationMessages.common.maxlength(control.errors['maxlength'].requiredLength);
    } else if (control.errors['email']) {
      return this.validationMessages.common.email;
    }
    
    return null;
  }
} 