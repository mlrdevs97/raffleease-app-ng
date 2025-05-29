export interface Customer {
    stripeId?: string | null;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    createdAt: string; 
    updatedAt: string;
}