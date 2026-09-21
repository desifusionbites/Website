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
  email?: string;
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
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  awbCode?: string;
  status: 'created' | 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'failed' | 'unfulfilled';
  isMock?: boolean;
  error?: string;
}

export interface ShippingRateEstimate {
  carrierName: string;
  estimatedDays: number;
  rateINR: number;
}

/**
 * Parses weight representations such as "200g", "150 gm", "1kg", "0.5 kg", or raw numbers into grams
 */
export function parseWeightInGrams(weight?: string | number | null): number {
  if (typeof weight === 'number' && !isNaN(weight) && weight > 0) {
    return Math.round(weight);
  }
  if (!weight || typeof weight !== 'string') {
    return 200; // Default standard snack pack 200g
  }

  const str = weight.trim().toLowerCase();
  
  // Match "1.5 kg", "1kg", "500 grams", "250g", "150 gm"
  const kgMatch = str.match(/([\d.]+)\s*(?:kg|kilos?|kilograms?)/i);
  if (kgMatch && kgMatch[1]) {
    const val = parseFloat(kgMatch[1]);
    if (!isNaN(val) && val > 0) return Math.round(val * 1000);
  }

  const gMatch = str.match(/([\d.]+)\s*(?:gm|gms|grams?|g)/i);
  if (gMatch && gMatch[1]) {
    const val = parseFloat(gMatch[1]);
    if (!isNaN(val) && val > 0) return Math.round(val);
  }

  const num = parseFloat(str);
  if (!isNaN(num) && num > 0) {
    return Math.round(num <= 10 ? num * 1000 : num);
  }

  return 200;
}

/**
 * Calculates realistic total weight in grams and package dimensions for shipment
 */
export function calculateOrderWeightAndDimensions(
  items: Array<{ quantity: number; weight_snapshot?: string | null; weightGrams?: number; name?: string }>
): { totalWeightGrams: number; length: number; breadth: number; height: number } {
  const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  
  const totalWeightGrams = items.reduce((sum, item) => {
    const itemWeight = parseWeightInGrams(item.weight_snapshot || item.weightGrams);
    return sum + itemWeight * (Number(item.quantity) || 1);
  }, 0);

  let length = 15;
  let breadth = 15;
  let height = 10;

  if (totalUnits > 6) {
    length = 30;
    breadth = 25;
    height = 20;
  } else if (totalUnits > 2) {
    length = 20;
    breadth = 20;
    height = 15;
  }

  return {
    totalWeightGrams: Math.max(200, totalWeightGrams),
    length,
    breadth,
    height,
  };
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
  async createShipment(_params: CreateShipmentParams): Promise<ShipmentResult> {
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

import { ShiprocketProvider } from './shiprocket';
export { ShiprocketProvider } from './shiprocket';

/**
 * Factory to get active shipping provider
 */
export function getShippingProvider(): ShippingProvider {
  const provider = process.env.SHIPPING_PROVIDER?.toLowerCase();
  const shiprocketEnabled = process.env.SHIPROCKET_ENABLED === 'true';

  if (provider === 'shiprocket' || shiprocketEnabled) {
    return new ShiprocketProvider();
  }

  return new ManualShippingProvider();
}
