import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethods, PaymentStatus } from '../../../models/order.model';
import { DropdownSelectComponent } from '../../../../../layout/components/dropdown-select/dropdown-select.component';
@Component({
    selector: 'app-orders-search-payment-info',
    standalone: true,
    imports: [CommonModule, DropdownSelectComponent],
    templateUrl: './orders-search-payment-info.component.html',
})
export class OrdersSearchPaymentInfoComponent {
    @Input() criteria: any = {};
    @Output() criteriaChange = new EventEmitter<any>();
    
    paymentStatusOptions = Object.values(PaymentStatus);
    paymentMethodOptions = Object.values(PaymentMethods);
    
    updateCriteria(data: any): void {
        const updatedCriteria = { ...this.criteria, ...data };
        this.criteriaChange.emit(updatedCriteria);
    }
}