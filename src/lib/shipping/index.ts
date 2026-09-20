// ========================================================================
// DESI FUSION BITES - PROVIDER-AGNOSTIC SHIPPING SERVICE
// ========================================================================
// Strict rules:
// 1. Fully provider-independent interface.
// 2. Default implementation is ManualShippingProvider.
// 3. Extensible for whichever courier partner the business signs with.
// ========================================================================

export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface ShipmentItem {
  sku: string;
  name: string;
  quantity: number;
  weightGrams?: number;
  priceINR: number;
}

export interface CreateShipmentParams {
  orderId: string;
  recipient: ShippingAddress;
  items: ShipmentItem[];
  totalWeightGrams: number;
  isCOD?: boolean;
}

export interface ShipmentResult {
  success: boolean;
  trackingNumber?: string;
  trackingUrl?: string;
  carrierName?: string;
  labelUrl?: string;
  status: 'created' | 'pending' | 'shipped' | 'delivered' | 'cancelled';
  error?: string;
}

export interface ShippingRateEstimate {
  carrierName: string;
  estimatedDays: number;
  rateINR: number;
}

/**
 * Universal Shipping Provider Interface
 */
export interface ShippingProvider {
  createShipment(params: CreateShipmentParams): Promise<ShipmentResult>;
  getRates(pincode: string, weightGrams: number): Promise<ShippingRateEstimate[]>;
  getTrackingStatus(trackingNumber: string): Promise<{ status: string; history?: unknown[] }>;
  cancelShipment(trackingNumber: string): Promise<{ success: boolean; error?: string }>;
}

/**
 * Default Manual Shipping Provider
 * Allows the business to manage shipments manually via any courier receipt/waybill.
 */
export class ManualShippingProvider implements ShippingProvider {
  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    const trackingNumber = `DFB-MANUAL-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      trackingNumber,
      carrierName: 'Manual Courier Partner',
      status: 'created',
    };
  }

  async getRates(_pincode: string, _weightGrams: number): Promise<ShippingRateEstimate[]> {
    return [
      {
        carrierName: 'Standard Courier Delivery',
        estimatedDays: 4,
        rateINR: 60,
      },
    ];
  }

  async getTrackingStatus(trackingNumber: string) {
    return {
      status: 'In Transit',
      trackingNumber,
      history: [
        {
          timestamp: new Date().toISOString(),
          activity: 'Manual shipment entry created',
        },
      ],
    };
  }

  async cancelShipment(_trackingNumber: string) {
    return { success: true };
  }
}

/**
 * Factory to get active shipping provider
 */
export function getShippingProvider(): ShippingProvider {
  // Can be switched when provider is finalized via process.env.SHIPPING_PROVIDER
  return new ManualShippingProvider();
}
