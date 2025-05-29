import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OrderSearchFilters } from '../../../models/order.model';
import { dateRangeValidator } from '../../../../../core/validators/date.validators';
import { ClientValidationMessages } from '../../../../../core/constants/client-validation-messages';

@Component({
  selector: 'app-orders-search-dates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders-search-dates.component.html',
})
export class OrdersSearchDatesComponent implements OnInit, OnChanges {
  @Input() criteria: OrderSearchFilters = {};
  @Input() fieldErrors: Record<string, string> = {};
  @Output() criteriaChange = new EventEmitter<Partial<OrderSearchFilters>>();
  
  searchForm: FormGroup;
  validationMessages = ClientValidationMessages;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      createdFrom: [null],
      createdTo: [null],
      completedFrom: [null],
      completedTo: [null],
      cancelledFrom: [null],
      cancelledTo: [null]
    }, { 
      validators: [
        dateRangeValidator('createdFrom', 'createdTo'),
        dateRangeValidator('completedFrom', 'completedTo'),
        dateRangeValidator('cancelledFrom', 'cancelledTo')
      ] 
    });
  }

  ngOnInit(): void {
    // Initialize form with criteria if any
    this.updateFormFromCriteria();
    
    // React to form changes
    this.searchForm.valueChanges.subscribe(formValues => {
      // Only emit if the form is valid
      if (this.searchForm.valid) {
        // Filter out null values to prevent them from being added to criteria
        const cleanValues = Object.entries(formValues)
          .filter(([_, value]) => value !== null && value !== '')
          .reduce((acc, [key, value]) => ({...acc, [key]: value}), {} as Partial<OrderSearchFilters>);
          
        this.updateCriteria(cleanValues);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detect when criteria is reset to an empty object or changes
    if (changes['criteria']) {
      this.updateFormFromCriteria();
      
      // Force reset when criteria is empty (happens when reset button is clicked)
      if (Object.keys(this.criteria || {}).length === 0) {
        this.resetForm();
      }
    }
    
    // Apply server validation errors if any
    if (changes['fieldErrors'] && this.fieldErrors) {
      this.applyFieldErrors();
    }
  }

  resetForm(): void {
    // Reset all date controls to null (more reliable for date inputs)
    this.searchForm.reset({
      createdFrom: null,
      createdTo: null,
      completedFrom: null,
      completedTo: null,
      cancelledFrom: null,
      cancelledTo: null
    }, { emitEvent: false });
    
    // Force DOM update by clearing the actual input elements
    setTimeout(() => {
      const dateInputs = document.querySelectorAll('input[type="date"]');
      dateInputs.forEach((element: Element) => {
        // Type assertion to HTMLInputElement
        const input = element as HTMLInputElement;
        input.value = '';
      });
      
      // Force Angular to detect changes and update the view
      this.cdr.detectChanges();
    });
  }

  updateFormFromCriteria(): void {
    // Reset form when criteria is empty or update with existing values
    if (Object.keys(this.criteria || {}).length === 0) {
      this.resetForm();
    } else {
      this.searchForm.patchValue({
        createdFrom: this.criteria?.createdFrom || null,
        createdTo: this.criteria?.createdTo || null,
        completedFrom: this.criteria?.completedFrom || null,
        completedTo: this.criteria?.completedTo || null,
        cancelledFrom: this.criteria?.cancelledFrom || null,
        cancelledTo: this.criteria?.cancelledTo || null
      }, { emitEvent: false }); // Prevent triggering valueChanges subscription
      
      // Force change detection
      this.cdr.detectChanges();
    }
  }
  
  updateCriteria(data: Partial<OrderSearchFilters>): void {
    this.criteriaChange.emit(data);
  }
  
  applyFieldErrors(): void {
    const dateErrorFields = Object.keys(this.fieldErrors).filter(
      field => field.includes('date') || field.includes('Date') || 
              field.includes('created') || field.includes('completed') || field.includes('cancelled')
    );
    
    dateErrorFields.forEach(fieldPath => {
      const control = this.searchForm.get(fieldPath);
      if (control) {
        control.markAsTouched();
        control.setErrors({ serverError: this.fieldErrors[fieldPath] });
      }
    });
  }
  
  // Helper method to get error message for a control
  getErrorMessage(controlName: string): string | null {
    const control = this.searchForm.get(controlName);
    if (!control?.touched || !control.errors) return null;
    
    // Check for server error first
    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }
    
    return null;
  }
  
  // Helper method to check for date range errors
  getDateRangeErrorMessage(fromField: string, toField: string): string | null {
    if (this.searchForm.hasError('dateRange')) {
      const error = this.searchForm.getError('dateRange');
      if (error.from === fromField && error.to === toField) {
        return this.validationMessages.date.dateRange;
      }
    }
    return null;
  }
} 