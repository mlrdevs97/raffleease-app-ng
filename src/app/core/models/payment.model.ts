export interface Payment {
    id: number;
    orderId: number;
    paymentMethod: PaymentMethod;
    total: number;
    createdAt: string;
    updatedAt: string;
}

export enum PaymentMethod {
    CARD = 'CARD',
    PAYPAL = 'PAYPAL',
    BIZUM = 'BIZUM',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CASH = 'CASH',
}