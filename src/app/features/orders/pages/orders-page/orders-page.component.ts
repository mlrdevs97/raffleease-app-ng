import { Component } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common'; // NgComponentOutlet from previous fix
import { RouterModule } from '@angular/router';
import { OrdersToolbarComponent } from '../../components/orders-toolbar/orders-toolbar.component';
import { OrdersTableComponent } from '../../components/orders-table/orders-table.component';
import { Order, OrderStatus, OrderSource, PaymentStatus, CustomerSourceType } from '../../models/order.model';

@Component({
    selector: 'app-orders-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        OrdersToolbarComponent,
        OrdersTableComponent
    ],
    templateUrl: './orders-page.component.html',
})
export class OrdersPageComponent {
    orders: Order[] = [
        {
            id: 3000, 
            raffleSummary: {
                id: 101,
                title: 'Bear Hug: Live in Concert',
                imageURL: 'https://picsum.photos/200'
            },
            orderReference: 'ORD-3000',
            orderSource: OrderSource.CUSTOMER,
            status: OrderStatus.COMPLETED,
            orderItems: [
                { id: 1, ticketNumber: 'T001', priceAtPurchase: 80.00, ticketId: 1001, raffleId: 101 }
            ],
            payment: {
                status: PaymentStatus.SUCCEEDED,
                paymentMethod: 'card_123',
                total: 80.00,
                currencyCode: 'USD',
                paymentIntentId: 'pi_123',
                createdAt: '2024-05-09T10:00:00Z',
                updatedAt: '2024-05-09T10:00:00Z',
                completedAt: '2024-05-09T10:00:00Z',
                cancelledAt: null
            },
            customer: {
                fullName: 'Leslie Alexander',
                email: 'leslie@example.com',
                sourceType: CustomerSourceType.STRIPE,
                createdAt: '2024-01-01T10:00:00Z',
                updatedAt: '2024-01-01T10:00:00Z'
            },
            comment: null,
            createdAt: '2024-05-09T10:00:00Z',
            updatedAt: '2024-05-09T10:00:00Z',
            completedAt: '2024-05-09T10:00:00Z',
            cancelledAt: null
        },
        {
            id: 3001,
            raffleSummary: {
                id: 102,
                title: 'Six Fingers — DJ Set',
                imageURL: 'https://picsum.photos/200'
            },
            orderReference: 'ORD-3001',
            orderSource: OrderSource.CUSTOMER,
            status: OrderStatus.COMPLETED,
            orderItems: [
                { id: 2, ticketNumber: 'T002', priceAtPurchase: 299.00, ticketId: 1002, raffleId: 102 } 
            ],
            payment: {
                status: PaymentStatus.SUCCEEDED,
                paymentMethod: 'card_456',
                total: 299.00,
                currencyCode: 'USD',
                paymentIntentId: 'pi_456',
                createdAt: '2024-05-05T11:00:00Z',
                updatedAt: '2024-05-05T11:00:00Z',
                completedAt: '2024-05-05T11:00:00Z',
                cancelledAt: null
            },
            customer: {
                fullName: 'Michael Foster',
                email: 'michael@example.com',
                sourceType: CustomerSourceType.STRIPE,
                createdAt: '2024-02-01T10:00:00Z',
                updatedAt: '2024-02-01T10:00:00Z'
            },
            comment: 'VIP seating requested',
            createdAt: '2024-05-05T11:00:00Z',
            updatedAt: '2024-05-05T11:00:00Z',
            completedAt: '2024-05-05T11:00:00Z',
            cancelledAt: null
        },
        {
            id: 3002,
            raffleSummary: {
                id: 103,
                title: 'We All Look The Same',
                imageURL: 'https://picsum.photos/200'
            },
            orderReference: 'ORD-3002',
            orderSource: OrderSource.ADMIN,
            status: OrderStatus.PENDING,
            orderItems: [
                { id: 3, ticketNumber: 'T003', priceAtPurchase: 150.00, ticketId: 1003, raffleId: 103 }
            ],
            payment: {
                status: PaymentStatus.PENDING,
                paymentMethod: 'card_789',
                total: 150.00,
                currencyCode: 'USD',
                paymentIntentId: 'pi_789',
                createdAt: '2024-04-28T12:00:00Z',
                updatedAt: '2024-04-28T12:00:00Z',
                completedAt: null,
                cancelledAt: null
            },
            customer: {
                fullName: 'Dries Vincent',
                email: 'dries@example.com',
                sourceType: CustomerSourceType.STRIPE,
                createdAt: '2024-03-01T10:00:00Z',
                updatedAt: '2024-03-01T10:00:00Z'
            },
            comment: null,
            createdAt: '2024-04-28T12:00:00Z',
            updatedAt: '2024-04-28T12:00:00Z',
            completedAt: null,
            cancelledAt: null
        },
        {
            id: 3004,
            raffleSummary: {
                id: 104,
                title: 'Viking People',
                imageURL: 'https://picsum.photos/200'
            },
            orderReference: 'ORD-3004',
            orderSource: OrderSource.CUSTOMER,
            status: OrderStatus.CANCELLED,
            orderItems: [
                { id: 5, ticketNumber: 'T005', priceAtPurchase: 114.99, ticketId: 1005, raffleId: 104 }
            ],
            payment: {
                status: PaymentStatus.REFUNDED,
                paymentMethod: 'card_abc',
                total: 114.99,
                currencyCode: 'USD',
                paymentIntentId: 'pi_abc',
                createdAt: '2024-04-18T10:00:00Z',
                updatedAt: '2024-04-18T10:05:00Z',
                completedAt: null,
                cancelledAt: '2024-04-18T10:05:00Z'
            },
            customer: {
                fullName: 'Courtney Henry',
                email: 'courtney@example.com',
                sourceType: CustomerSourceType.STRIPE,
                createdAt: '2024-03-15T10:00:00Z',
                updatedAt: '2024-03-15T10:00:00Z'
            },
            comment: 'User requested cancellation.',
            createdAt: '2024-04-18T10:00:00Z',
            updatedAt: '2024-04-18T10:05:00Z',
            completedAt: null,
            cancelledAt: '2024-04-18T10:05:00Z'
        }
    ];
}