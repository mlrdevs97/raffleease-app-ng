import { Customer } from "../../../core/models/customer.model";
import { Payment, PaymentMethod } from "../../../core/models/payment.model";
import { RaffleStatus } from "../../raffles/models/raffle.model";

export enum OrderStatus {
    PENDING = 'PENDING',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    UNPAID = 'UNPAID',
    REFUNDED = 'REFUNDED'
}

export interface OrderItem {
    id: number;
    ticketNumber: string;
    priceAtPurchase: number;
    ticketId: number;
    raffleId: number;
    customerId: number;
}

export interface Order {
    id: number;
    raffleSummary: OrderRaffleSummary;
    orderReference: string;
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
    status: RaffleStatus;
}

export interface EventDisplayDetails {
    name: string;
    imageUrl: string;
}

export interface OrderSearchFilters {
    status?: OrderStatus;
    paymentMethod?: PaymentMethod;
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