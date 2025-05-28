import { Customer } from "../../../core/models/customer.model";
import { Payment } from "../../../core/models/payment.model";
import { PaymentMethods, PaymentStatus } from "../../../core/models/payment.model";

export enum OrderSource {
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN'
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED'
}

export interface OrderItem {
    id: number;
    ticketNumber: string;
    priceAtPurchase: number;
    ticketId: number;
    raffleId: number;
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

export interface OrderSearchFilters {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethods;
    orderSource?: OrderSource;
    orderReference?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    raffleId?: number;
    minTotal?: number;
    maxTotal?: number;
    createdFrom?: string;
    createdTo?: string;
    completedFrom?: string;
    completedTo?: string;
    cancelledFrom?: string;
    cancelledTo?: string;
}