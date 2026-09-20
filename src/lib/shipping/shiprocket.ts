import {
  ShippingProvider,
  CreateShipmentParams,
  ShipmentResult,
  ShippingRateEstimate,
} from './index';

interface CachedToken {
  token: string;
  expiresAt: number;
}

let tokenCache: CachedToken | null = null;

export class ShiprocketProvider implements ShippingProvider {
  private email = process.env.SHIPROCKET_EMAIL || '';
  private password = process.env.SHIPROCKET_PASSWORD || '';
  private pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';
  private isEnabled = process.env.SHIPROCKET_ENABLED === 'true';

  /**
   * Retrieves or refreshes Shiprocket JWT Bearer Token
   */
  private async getAuthToken(): Promise<string | null> {
    if (!this.email || !this.password) {
      return null;
    }

    const now = Date.now();
    if (tokenCache && tokenCache.expiresAt > now + 60000) {
      return tokenCache.token;
    }

    try {
      const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      });

      if (!res.ok) {
        console.error('Shiprocket auth failed:', res.status, await res.text());
        return null;
      }

      const data = await res.json();
      if (data.token) {
        // Cache token for 23 hours (Shiprocket tokens typically valid for 24-48 hours)
        tokenCache = {
          token: data.token,
          expiresAt: now + 23 * 60 * 60 * 1000,
        };
        return data.token;
      }
      return null;
    } catch (err) {
      console.error('Shiprocket auth error:', err);
      return null;
    }
  }

  /**
   * Creates a custom adhoc shipment in Shiprocket
   */
  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    if (!this.isEnabled) {
      return {
        success: true,
        trackingNumber: `DFB-MOCK-${Date.now().toString().slice(-6)}`,
        carrierName: 'Shiprocket (Test Mode)',
        status: 'pending',
      };
    }

    const token = await this.getAuthToken();
    if (!token) {
      return {
        success: false,
        status: 'failed',
        error: 'Shiprocket authentication failed or credentials not configured',
      };
    }

    try {
      const orderDate = new Date().toISOString().slice(0, 10);
      const subtotal = params.items.reduce((sum, item) => sum + item.priceINR * item.quantity, 0);

      const orderPayload = {
        order_id: params.orderId,
        order_date: orderDate,
        pickup_location: this.pickupLocation,
        billing_customer_name: params.recipient.name,
        billing_last_name: '',
        billing_address: params.recipient.addressLine1,
        billing_address_2: params.recipient.addressLine2 || '',
        billing_city: params.recipient.city,
        billing_pincode: params.recipient.pincode,
        billing_state: params.recipient.state,
        billing_country: params.recipient.country || 'India',
        billing_email: params.recipient.email || 'care@desifusionbites.com',
        billing_phone: params.recipient.phone,
        shipping_is_billing: true,
        order_items: params.items.map((item) => ({
          name: item.name,
          sku: item.sku || `SKU-${item.name.replace(/\s+/g, '-').toUpperCase()}`,
          units: item.quantity,
          selling_price: item.priceINR,
          discount: 0,
          tax: 0,
        })),
        payment_method: 'Prepaid',
        sub_total: subtotal,
        length: 15,
        breadth: 15,
        height: 10,
        weight: Math.max(0.5, (params.totalWeightGrams || 500) / 1000),
      };

      const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const responseData = await res.json();

      if (!res.ok || responseData.status_code === 0) {
        return {
          success: false,
          status: 'failed',
          error: responseData.message || 'Shiprocket order creation rejected',
        };
      }

      return {
        success: true,
        trackingNumber: responseData.awb_code || responseData.shipment_id?.toString(),
        carrierName: responseData.courier_name || 'Shiprocket Assigned Courier',
        status: 'created',
        labelUrl: responseData.label_url,
      };
    } catch (err: unknown) {
      return {
        success: false,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Network error communicating with Shiprocket',
      };
    }
  }

  async getRates(_pincode: string, _weightGrams: number): Promise<ShippingRateEstimate[]> {
    return [
      {
        carrierName: 'Shiprocket Standard Courier',
        estimatedDays: 4,
        rateINR: 60,
      },
    ];
  }

  async getTrackingStatus(trackingNumber: string): Promise<{ status: string; history?: unknown[] }> {
    const token = await this.getAuthToken();
    if (!token) {
      return { status: 'In Transit', history: [] };
    }

    try {
      const res = await fetch(
        `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${trackingNumber}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) return { status: 'In Transit', history: [] };

      const data = await res.json();
      const currentStatus = data.tracking_data?.track_status === 1 ? 'Delivered' : 'In Transit';

      return {
        status: currentStatus,
        history: data.tracking_data?.shipment_track_activities || [],
      };
    } catch {
      return { status: 'In Transit', history: [] };
    }
  }

  async cancelShipment(trackingNumber: string): Promise<{ success: boolean; error?: string }> {
    const token = await this.getAuthToken();
    if (!token) return { success: false, error: 'Shiprocket not authenticated' };

    try {
      const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/cancel/shipment/awbs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ awbs: [trackingNumber] }),
      });

      if (!res.ok) return { success: false, error: 'Shipment cancellation failed' };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  }
}
