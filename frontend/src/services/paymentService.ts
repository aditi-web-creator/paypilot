import { request } from './api';
import { Order } from '../types';

export interface CreateOrderResult {
  paypalOrderId: string;
  status: string;
  approvalUrl?: string;
  amount: number;
  currency: string;
}

export interface CaptureOrderResult {
  captureId: string;
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paypalOrderId: string;
  order: Order;
  amount: number;
  currency: string;
  payer?: {
    name?: string;
    email_address?: string;
    payer_id?: string;
  };
}

export const paymentService = {
  async createPayPalOrder(currency: string = 'USD'): Promise<CreateOrderResult> {
    const res = await request<{ success: boolean; data: CreateOrderResult }>('/payments/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify({ currency }),
    });
    return res.data;
  },

  async capturePayPalOrder(orderId: string): Promise<CaptureOrderResult> {
    const res = await request<{ success: boolean; data: CaptureOrderResult }>('/payments/paypal/capture-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
    return res.data;
  },

  async getPayPalOrder(orderId: string): Promise<any> {
    const res = await request<{ success: boolean; data: any }>(`/payments/paypal/order/${orderId}`);
    return res.data;
  },
};
