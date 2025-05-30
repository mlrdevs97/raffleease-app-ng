export interface PhoneNumberData {
  prefix: string;
  nationalNumber: string;
}

export interface CustomerCreate {
  fullName: string;
  email?: string | null;
  phoneNumber?: PhoneNumberData | null;
}

export interface AdminOrderCreate {
  cartId: number;
  raffleId: number;
  ticketIds: number[];
  customer: CustomerCreate;
  comment?: string | null;
} 