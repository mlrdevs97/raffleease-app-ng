export interface Customer {
    stripeId?: string | null;
    sourceType: CustomerSourceType;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    createdAt: string; 
    updatedAt: string;
}

export enum CustomerSourceType {
    STRIPE = 'STRIPE',
    INTERNAL = 'ADMIN'
}