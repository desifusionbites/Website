import crypto from 'crypto';

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}

export function getRazorpayConfig(): RazorpayConfig {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

  return { keyId, keySecret, webhookSecret };
}

export interface CreateOrderParams {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Creates a Razorpay order via official REST API
 */
export async function createRazorpayOrder(
  params: CreateOrderParams
): Promise<{ success: boolean; data?: RazorpayOrderResponse; error?: string }> {
  const { keyId, keySecret } = getRazorpayConfig();

  if (!keyId || !keySecret) {
    // In local development / test mode without credentials, provide mock order ID
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        data: {
          id: `order_mock_${Date.now()}`,
          entity: 'order',
          amount: params.amountPaise,
          amount_paid: 0,
          amount_due: params.amountPaise,
          currency: params.currency || 'INR',
          receipt: params.receipt,
          status: 'created',
          attempts: 0,
          notes: params.notes || {},
          created_at: Math.floor(Date.now() / 1000),
        },
      };
    }
    return {
      success: false,
      error: 'Razorpay credentials (NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing.',
    };
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: params.amountPaise,
        currency: params.currency || 'INR',
        receipt: params.receipt,
        notes: params.notes || {},
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.description || 'Razorpay order creation failed',
      };
    }

    return { success: true, data: data as RazorpayOrderResponse };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error during Razorpay order creation',
    };
  }
}

/**
 * Verifies Razorpay payment signature server-side using timing-safe HMAC-SHA256
 */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const { keySecret } = getRazorpayConfig();

  // Test mode fallback
  if (!keySecret && process.env.NODE_ENV === 'development') {
    return Boolean(params.razorpayOrderId && params.razorpayPaymentId);
  }

  if (!keySecret) return false;

  try {
    const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature);
    const actualBuf = Buffer.from(params.razorpaySignature);

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const { webhookSecret } = getRazorpayConfig();
  if (!webhookSecret) return false;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature);
    const actualBuf = Buffer.from(signature);

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

/**
 * Fetches authorized payment details from Razorpay API
 */
export async function fetchPaymentDetails(paymentId: string) {
  const { keyId, keySecret } = getRazorpayConfig();
  if (!keyId || !keySecret) return null;

  try {
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
