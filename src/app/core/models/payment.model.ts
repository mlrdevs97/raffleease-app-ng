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