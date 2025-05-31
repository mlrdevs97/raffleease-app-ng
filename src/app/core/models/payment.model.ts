export interface Payment {
    paymentMethod: PaymentMethods;
    total: number;
    currencyCode?: string;
    paymentIntentId: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string | null;
    cancelledAt?: string | null;
}

export enum PaymentMethods {
    CARD = 'CARD',
    PAYPAL = 'PAYPAL',
    BIZUM = 'BIZUM',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CASH = 'CASH',
}