import { PaymentMethods } from '../../../core/models/payment.model';

export interface OrderComplete {
  paymentMethod: PaymentMethods;
} 