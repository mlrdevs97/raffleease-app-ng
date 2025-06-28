import { OrderStatus } from '../../features/orders/models/order.model';

/**
 * Get CSS classes for order status styling
 * @param status The order status
 * @returns CSS classes string for the status badge
 */
export function getOrderStatusClasses(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.COMPLETED:
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case OrderStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case OrderStatus.REFUNDED:
    case OrderStatus.UNPAID:
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
} 