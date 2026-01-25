/**
 * 支付服务提供商接口
 */

export interface PaymentProvider {
  name: string;
  createOrder(options: CreateOrderOptions): Promise<PaymentOrder>;
  queryOrder(orderId: string): Promise<PaymentOrder | null>;
  refund(orderId: string, amount?: number): Promise<PaymentRefund>;
  verifyNotification(notification: any): Promise<boolean>;
}

export interface CreateOrderOptions {
  orderId: string;
  amount: number;
  subject: string;
  description?: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  paymentUrl?: string;
  qrCode?: string;
  transactionId?: string;
  paidAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface PaymentRefund {
  refundId: string;
  orderId: string;
  amount: number;
  status: 'success' | 'failed' | 'processing';
  transactionId?: string;
  refundedAt?: Date;
}
