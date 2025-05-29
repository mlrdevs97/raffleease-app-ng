import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersSearchOrderInfoComponent } from '../orders-search-order-info/orders-search-order-info.component';
import { OrdersSearchCustomerComponent } from '../orders-search-customer/orders-search-customer.component';
import { OrdersSearchPaymentInfoComponent } from '../orders-search-payment-info/orders-search-payment-info.component';
import { OrdersSearchDatesComponent } from '../orders-search-dates/orders-search-dates.component';
import { OrderSearchFilters } from '../../../models/order.model';
import { Subscription } from 'rxjs';

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
export class OrdersSearchTabsComponent implements OnChanges, OnInit, OnDestroy {
    @Input() criteria: OrderSearchFilters = {};
    @Input() resetEvent!: EventEmitter<void>;
    @Input() fieldErrors: Record<string, string> = {};
    @Output() criteriaChange = new EventEmitter<OrderSearchFilters>();
    
    activeTab: 'order' | 'payment' | 'customer' | 'dates' = 'order';
    private resetSubscription?: Subscription;

    ngOnInit(): void {
        // Subscribe to reset events
        if (this.resetEvent) {
            this.resetSubscription = this.resetEvent.subscribe(() => {
                // Reset active tab to default
                this.activeTab = 'order';
                
                // Propagate empty criteria to child components
                this.criteriaChange.emit({});
            });
        }
    }

    ngOnDestroy(): void {
        // Clean up subscription
        if (this.resetSubscription) {
            this.resetSubscription.unsubscribe();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Detect when criteria is reset to an empty object
        if (changes['criteria'] && 
            Object.keys(changes['criteria'].currentValue || {}).length === 0 && 
            Object.keys(changes['criteria'].previousValue || {}).length > 0) {
            
            // Reset activeTab to default
            this.activeTab = 'order';
        }
        
        // If field errors appear, switch to the tab containing the error
        if (changes['fieldErrors'] && this.fieldErrors) {
            const errorFields = Object.keys(this.fieldErrors);
            if (errorFields.length > 0) {
                // Determine which tab to activate based on field names with errors
                if (errorFields.some(field => field.startsWith('order.') || field === 'raffleId')) {
                    this.activeTab = 'order';
                } else if (errorFields.some(field => field.startsWith('payment.') || field.includes('amount'))) {
                    this.activeTab = 'payment';
                } else if (errorFields.some(field => field.startsWith('customer.'))) {
                    this.activeTab = 'customer';
                } else if (errorFields.some(field => field.includes('date') || field.includes('Date'))) {
                    this.activeTab = 'dates';
                }
            }
        }
    }

    setActiveTab(tab: 'order' | 'payment' | 'customer' | 'dates'): void {
        this.activeTab = tab;
    }
    
    onOrderInfoCriteriaChange(orderCriteria: Partial<OrderSearchFilters>): void {
        this.criteria = { ...this.criteria, ...orderCriteria };
        this.criteriaChange.emit(this.criteria);
    }
    
    onPaymentInfoCriteriaChange(paymentCriteria: Partial<OrderSearchFilters>): void {
        this.criteria = { ...this.criteria, ...paymentCriteria };
        this.criteriaChange.emit(this.criteria);
    }
    
    onCustomerCriteriaChange(customerCriteria: Partial<OrderSearchFilters>): void {
        this.criteria = { ...this.criteria, ...customerCriteria };
        this.criteriaChange.emit(this.criteria);
    }
    
    onDatesCriteriaChange(datesCriteria: Partial<OrderSearchFilters>): void {
        this.criteria = { ...this.criteria, ...datesCriteria };
        this.criteriaChange.emit(this.criteria);
    }
}