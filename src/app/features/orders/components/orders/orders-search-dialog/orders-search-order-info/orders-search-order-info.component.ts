import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';
import { OrderStatus, OrderSearchFilters } from '../../../../models/order.model';
import { DropdownSelectComponent } from '../../../../../../shared/components/dropdown-select/dropdown-select.component';
import { positiveNumberValidator } from '../../../../../../core/validators/number.validators';
import { ClientValidationMessages } from '../../../../../../core/constants/client-validation-messages';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-orders-search-order-info',
    standalone: true,
    imports: [CommonModule, DropdownSelectComponent, ReactiveFormsModule],
    templateUrl: './orders-search-order-info.component.html',
})
export class OrdersSearchOrderInfoComponent implements OnInit, OnChanges, OnDestroy {
    @Input() criteria: OrderSearchFilters = {};
    @Input() fieldErrors: Record<string, string> = {};
    @Input() resetEvent!: EventEmitter<void>;
    @Output() criteriaChange = new EventEmitter<Partial<OrderSearchFilters>>();
    @Output() hasInteraction = new EventEmitter<boolean>();
    
    orderStatusOptions = Object.values(OrderStatus); 
    
    searchForm: FormGroup;
    validationMessages = ClientValidationMessages;
    private userHasInteracted = false;
    private resetSubscription?: Subscription;
    
    constructor(private fb: FormBuilder) {
        this.searchForm = this.fb.group({
            status: [''],
            orderReference: [''],
            raffleId: ['', [positiveNumberValidator()]]
        });
    }
    
    ngOnInit(): void {
        this.updateFormFromCriteria();
        
        if (this.resetEvent) {
            this.resetSubscription = this.resetEvent.subscribe(() => {
                this.resetInteractionTracking();
            });
        }
        
        this.searchForm.valueChanges.pipe(
            distinctUntilChanged((prev, curr) => {
                return JSON.stringify(prev) === JSON.stringify(curr);
            })
        ).subscribe(formValues => {
            if (!this.userHasInteracted) {
                this.userHasInteracted = true;
                this.hasInteraction.emit(true);
            }
            
            this.updateCriteria(formValues);
        });
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['criteria'] && changes['criteria'].previousValue !== changes['criteria'].currentValue) {
            const prevCriteria = changes['criteria'].previousValue || {};
            const currCriteria = changes['criteria'].currentValue || {};
            
            if (JSON.stringify(prevCriteria) !== JSON.stringify(currCriteria)) {
                this.updateFormFromCriteria();
            }
        }
        
        if (changes['fieldErrors'] && this.fieldErrors) {
            this.applyFieldErrors();
        }
    }

    updateFormFromCriteria(): void {
        const formValues = {
            status: this.criteria?.status || '',
            orderReference: this.criteria?.orderReference || '',
            raffleId: this.criteria?.raffleId || ''
        };
        
        this.searchForm.patchValue(formValues, { emitEvent: false });
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

    getErrorMessage(controlName: string): string | null {
        const control = this.searchForm.get(controlName);
        if (!control?.touched || !control.errors) return null;
        
        if (control.errors['serverError']) {
            return control.errors['serverError'];
        }
        
        if (control.errors['required']) {
            return this.validationMessages.common.required;
        } else if (control.errors['positiveNumber']) {
            return this.validationMessages.number.positive;
        }
        
        return null;
    }

    ngOnDestroy(): void {
        if (this.resetSubscription) {
            this.resetSubscription.unsubscribe();
        }
    }

    resetInteractionTracking(): void {
        this.userHasInteracted = false;
        this.hasInteraction.emit(false);
    }
}