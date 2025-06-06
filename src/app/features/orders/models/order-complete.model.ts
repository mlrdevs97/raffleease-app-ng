import { PaymentMethod } from '../../../core/models/payment.model';

export interface OrderComplete {
  paymentMethod: PaymentMethod;
} 