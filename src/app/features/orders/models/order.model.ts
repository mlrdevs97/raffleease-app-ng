export enum OrderSource {
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN'
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED'
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCEEDED = 'SUCCEEDED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    UNPAID = 'UNPAID',
    CANCELLED = 'CANCELLED'
}

export enum PaymentMethods {
    CARD = 'CARD',
    PAYPAL = 'PAYPAL',
    BIZUM = 'BIZUM',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CASH = 'CASH',
}

export enum CustomerSourceType {
    STRIPE = 'STRIPE',
    INTERNAL = 'ADMIN'
}

export interface OrderItem {
    id: number;
    ticketNumber: string;
    priceAtPurchase: number;
    ticketId: number;
    raffleId: number;
}

export interface Payment {
    status: PaymentStatus;
    paymentMethod: string;
    total: number;
    currencyCode?: string;
    paymentIntentId: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string | null;
    cancelledAt?: string | null;
}

export interface Customer {
    stripeId?: string | null;
    sourceType: CustomerSourceType;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    createdAt: string; 
    updatedAt: string;
}

export interface Order {
    id: number;
    raffleSummary: OrderRaffleSummary;
    orderReference: string;
    orderSource: OrderSource;
    status: OrderStatus;
    orderItems: OrderItem[];
    payment: Payment;
    customer: Customer;
    comment?: string | null;
    createdAt: string; 
    updatedAt: string; 
    completedAt?: string | null;
    cancelledAt?: string | null;
}

export interface OrderRaffleSummary {
    id: number;
    title: string;
    imageURL: string;
}

export interface EventDisplayDetails {
    name: string;
    imageUrl: string;
}