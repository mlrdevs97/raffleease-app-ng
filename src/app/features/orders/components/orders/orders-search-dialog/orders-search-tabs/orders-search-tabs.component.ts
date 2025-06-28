import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersSearchOrderInfoComponent } from '../orders-search-order-info/orders-search-order-info.component';
import { OrdersSearchCustomerComponent } from '../orders-search-customer/orders-search-customer.component';
import { OrdersSearchPaymentInfoComponent } from '../orders-search-payment-info/orders-search-payment-info.component';
import { OrdersSearchDatesComponent } from '../orders-search-dates/orders-search-dates.component';
import { OrderSearchFilters } from '../../../../models/order.model';
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
    @Output() hasInteraction = new EventEmitter<boolean>();
    
    activeTab: 'order' | 'payment' | 'customer' | 'dates' = 'order';
    private resetSubscription?: Subscription;

    ngOnInit(): void {
        if (this.resetEvent) {
            this.resetSubscription = this.resetEvent.subscribe(() => {
                this.activeTab = 'order';
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
        if (changes['criteria'] && 
            Object.keys(changes['criteria'].currentValue || {}).length === 0 && 
            Object.keys(changes['criteria'].previousValue || {}).length > 0) {
            
            this.activeTab = 'order';
        }
        
        if (changes['fieldErrors'] && this.fieldErrors) {
            const errorFields = Object.keys(this.fieldErrors);
            if (errorFields.length > 0) {
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
        const updatedCriteria = { ...this.criteria };        
        const orderFields = ['status', 'orderReference', 'raffleId'];
        
        orderFields.forEach(field => {
            delete updatedCriteria[field as keyof OrderSearchFilters];
        });
        
        Object.entries(orderCriteria).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                updatedCriteria[key as keyof OrderSearchFilters] = value as any;
            }
        });
        
        this.criteria = updatedCriteria;
        this.criteriaChange.emit(this.criteria);
    }
    
    onOrderInfoInteraction(hasInteraction: boolean): void {
        this.hasInteraction.emit(hasInteraction);
    }
    
    onPaymentInfoCriteriaChange(paymentCriteria: Partial<OrderSearchFilters>): void {
        const updatedCriteria = { ...this.criteria };        
        const paymentFields = ['paymentStatus', 'paymentMethod', 'amount', 'minAmount', 'maxAmount'];
        
        paymentFields.forEach(field => {
            delete updatedCriteria[field as keyof OrderSearchFilters];
        });
        
        Object.entries(paymentCriteria).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                updatedCriteria[key as keyof OrderSearchFilters] = value as any;
            }
        });
        
        this.criteria = updatedCriteria;
        this.criteriaChange.emit(this.criteria);
    }
    
    onCustomerCriteriaChange(customerCriteria: Partial<OrderSearchFilters>): void {
        const updatedCriteria = { ...this.criteria };
        const customerFields = ['customerEmail', 'customerName', 'customerId'];
        
        customerFields.forEach(field => {
            delete updatedCriteria[field as keyof OrderSearchFilters];
        });
        
        Object.entries(customerCriteria).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                updatedCriteria[key as keyof OrderSearchFilters] = value as any;
            }
        });
        
        this.criteria = updatedCriteria;
        this.criteriaChange.emit(this.criteria);
    }
    
    onDatesCriteriaChange(datesCriteria: Partial<OrderSearchFilters>): void {
        const updatedCriteria = { ...this.criteria };
        const dateFields = ['startDate', 'endDate', 'createdAfter', 'createdBefore'];
        
        dateFields.forEach(field => {
            delete updatedCriteria[field as keyof OrderSearchFilters];
        });
        
        Object.entries(datesCriteria).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                updatedCriteria[key as keyof OrderSearchFilters] = value as any;
            }
        });
        
        this.criteria = updatedCriteria;
        this.criteriaChange.emit(this.criteria);
    }
}