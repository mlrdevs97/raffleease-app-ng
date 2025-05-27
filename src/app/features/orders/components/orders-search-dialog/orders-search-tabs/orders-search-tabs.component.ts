import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersSearchOrderInfoComponent } from '../orders-search-order-info/orders-search-order-info.component';
import { OrdersSearchCustomerComponent } from '../orders-search-customer/orders-search-customer.component';
import { OrdersSearchPaymentInfoComponent } from '../orders-search-payment-info/orders-search-payment-info.component';
import { OrdersSearchDatesComponent } from '../orders-search-dates/orders-search-dates.component';

@Component({
    selector: 'app-orders-search-tabs',
    standalone: true,
    imports: [
        CommonModule, 
        OrdersSearchOrderInfoComponent, 
        OrdersSearchPaymentInfoComponent, 
        OrdersSearchCustomerComponent, 
        OrdersSearchDatesComponent
    ],
    templateUrl: './orders-search-tabs.component.html',
})
export class OrdersSearchTabsComponent {
    @Input() criteria: any = {};
    @Output() criteriaChange = new EventEmitter<any>();
    
    activeTab: 'order' | 'payment' | 'customer' | 'dates' = 'order';

    setActiveTab(tab: 'order' | 'payment' | 'customer' | 'dates'): void {
        this.activeTab = tab;
    }
    
    onOrderInfoCriteriaChange(orderCriteria: any): void {
        this.criteria = { ...this.criteria, ...orderCriteria };
        this.criteriaChange.emit(this.criteria);
    }
    
    onPaymentInfoCriteriaChange(paymentCriteria: any): void {
        this.criteria = { ...this.criteria, ...paymentCriteria };
        this.criteriaChange.emit(this.criteria);
    }
    
    onCustomerCriteriaChange(customerCriteria: any): void {
        this.criteria = { ...this.criteria, ...customerCriteria };
        this.criteriaChange.emit(this.criteria);
    }
    
    onDatesCriteriaChange(datesCriteria: any): void {
        this.criteria = { ...this.criteria, ...datesCriteria };
        this.criteriaChange.emit(this.criteria);
    }
}