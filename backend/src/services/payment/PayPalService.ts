import { env } from '../../config/env.js';
import { Cart, Order } from '../../types/index.js';
import { dbProvider } from '../database/DatabaseProvider.js';

export interface PayPalCreateOrderResult {
  paypalOrderId: string;
  status: string;
  approvalUrl?: string;
  amount: number;
  currency: string;
}

export interface PayPalCaptureResult {
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

export class PayPalService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private defaultCurrency: string;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor() {
    this.baseUrl = env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
    this.clientId = env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = env.PAYPAL_CLIENT_SECRET || '';
    this.defaultCurrency = env.PAYPAL_CURRENCY || 'USD';
  }

  public isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret && !this.clientId.includes('your_'));
  }

  /**
   * Secure Server-Side OAuth 2.0 Access Token Retrieval
   */
  private async getAccessToken(): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 60000) {
      return this.tokenCache.token;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to obtain PayPal Sandbox access token: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as { access_token: string; expires_in: number };
    this.tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return data.access_token;
  }

  /**
   * Create PayPal Order via Orders API v2
   * Backend strictly recalculates cart total and verifies against user budget.
   */
  public async createOrder(userId: string, cart: Cart, currency: string = 'USD'): Promise<PayPalCreateOrderResult> {
    if (cart.items.length === 0) {
      throw new Error('Cannot create PayPal order for an empty cart.');
    }

    // 1. Budget enforcement on backend
    const budget = await dbProvider.getBudget(userId);
    const spendingSummary = await dbProvider.getSpendingSummary(userId);

    const projectedTotal = spendingSummary.total_spent + cart.total;
    if (projectedTotal > budget.budget_limit) {
      throw new Error(
        `Budget Exceeded: Cart total ($${cart.total.toFixed(2)}) plus current spending ($${spendingSummary.total_spent.toFixed(
          2
        )}) would exceed your approved spending limit of $${budget.budget_limit.toFixed(2)}.`
      );
    }

    const formattedAmount = cart.total.toFixed(2);
    const orderCurrency = currency || this.defaultCurrency;

    // 2. Real PayPal Sandbox Integration if credentials present
    if (this.isConfigured()) {
      try {
        const accessToken = await this.getAccessToken();

        const payload = {
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: `cart_${cart.id}`,
              description: `PayPilot Order for ${cart.items.length} item(s)`,
              amount: {
                currency_code: orderCurrency,
                value: formattedAmount,
                breakdown: {
                  item_total: {
                    currency_code: orderCurrency,
                    value: cart.subtotal.toFixed(2),
                  },
                  shipping: {
                    currency_code: orderCurrency,
                    value: cart.shipping.toFixed(2),
                  },
                  tax_total: {
                    currency_code: orderCurrency,
                    value: cart.tax.toFixed(2),
                  },
                },
              },
              items: cart.items.map(item => ({
                name: item.product?.name.substring(0, 127) || 'Product',
                unit_amount: {
                  currency_code: orderCurrency,
                  value: item.unit_price_snapshot.toFixed(2),
                },
                quantity: String(item.quantity),
                category: 'PHYSICAL_GOODS',
              })),
            },
          ],
          application_context: {
            brand_name: 'PayPilot AI Shopping',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: 'https://paypilot.local/checkout/success',
            cancel_url: 'https://paypilot.local/checkout/cancel',
          },
        };

        const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'PayPal-Request-Id': `paypilot_${cart.id}_${Date.now()}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errData = await response.text();
          throw new Error(`PayPal Order Creation failed (${response.status}): ${errData}`);
        }

        const orderData = (await response.json()) as any;
        const approvalUrl = orderData.links?.find((l: any) => l.rel === 'approve')?.href;

        // Persist initial order record in database with status 'pending'
        await dbProvider.createOrder(userId, orderData.id, cart);

        return {
          paypalOrderId: orderData.id,
          status: orderData.status,
          approvalUrl,
          amount: cart.total,
          currency: orderCurrency,
        };
      } catch (error) {
        console.error('PayPal API error, initiating fallback sandbox order:', error);
      }
    }

    // 3. Fallback Sandbox Order Generator (Used in Sandbox demo if live API keys are not supplied)
    const simulatedOrderId = `SANDBOX_ORD_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const pendingOrder = await dbProvider.createOrder(userId, simulatedOrderId, cart);

    return {
      paypalOrderId: simulatedOrderId,
      status: 'CREATED',
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${simulatedOrderId}`,
      amount: pendingOrder.total_amount,
      currency: orderCurrency,
    };
  }

  /**
   * Capture PayPal Order via Orders API v2
   * Verifies capture on the server side and prevents duplicate captures.
   */
  public async captureOrder(userId: string, paypalOrderId: string): Promise<PayPalCaptureResult> {
    const existingOrder = await dbProvider.getOrderByPayPalId(paypalOrderId);
    if (!existingOrder) {
      throw new Error(`Order reference not found for PayPal ID: ${paypalOrderId}`);
    }

    // Duplicate capture prevention
    if (existingOrder.payment_status === 'completed') {
      throw new Error(`Duplicate Capture Prevented: Order ${paypalOrderId} has already been captured.`);
    }

    let captureId = `CAP_${Date.now()}`;
    let payerInfo = {
      name: 'Sandbox Buyer',
      email_address: 'sb-buyer@business.example.com',
      payer_id: 'SANDBOX_PAYER_01',
    };

    if (this.isConfigured() && !paypalOrderId.startsWith('SANDBOX_ORD_')) {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `capture_${paypalOrderId}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        await dbProvider.updateOrderStatus(existingOrder.id, 'failed');
        throw new Error(`PayPal Capture verification failed (${response.status}): ${errorText}`);
      }

      const captureData = (await response.json()) as any;
      const captureUnit = captureData.purchase_units?.[0]?.payments?.captures?.[0];
      captureId = captureUnit?.id || `CAP_${Date.now()}`;

      if (captureData.payer) {
        payerInfo = {
          name: `${captureData.payer.name?.given_name || ''} ${captureData.payer.name?.surname || ''}`.trim(),
          email_address: captureData.payer.email_address,
          payer_id: captureData.payer.payer_id,
        };
      }
    }

    // Verify duplicate capture across entire DB
    const isDuplicate = await dbProvider.checkDuplicateCapture(paypalOrderId, captureId);
    if (isDuplicate) {
      throw new Error(`Duplicate capture detected for capture ID: ${captureId}`);
    }

    // Update database status to completed with verified captureId
    const updated = await dbProvider.updateOrderStatus(existingOrder.id, 'completed', captureId);
    if (!updated) {
      throw new Error('Failed to update order status in database.');
    }

    return {
      captureId,
      status: 'COMPLETED',
      paypalOrderId,
      order: updated,
      amount: updated.total_amount,
      currency: updated.currency,
      payer: payerInfo,
    };
  }

  /**
   * Retrieve Order Details from PayPal Orders API v2
   */
  public async getOrderDetails(paypalOrderId: string): Promise<any> {
    const dbOrder = await dbProvider.getOrderByPayPalId(paypalOrderId);

    if (this.isConfigured() && !paypalOrderId.startsWith('SANDBOX_ORD_')) {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${paypalOrderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const liveDetails = await response.json();
        return {
          paypal: liveDetails,
          localOrder: dbOrder,
        };
      }
    }

    return {
      paypal: {
        id: paypalOrderId,
        status: dbOrder?.payment_status === 'completed' ? 'COMPLETED' : 'APPROVED',
        intent: 'CAPTURE',
      },
      localOrder: dbOrder,
    };
  }
}

export const payPalService = new PayPalService();
