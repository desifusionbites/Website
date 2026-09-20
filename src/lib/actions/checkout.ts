'use server';

import { z } from 'zod';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import {
  createPendingOrder,
  updateOrderPaymentSuccess,
  recordShipment,
  recordIntegrationLog,
  getOrderByNumber,
} from '@/lib/db';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  getRazorpayConfig,
} from '@/lib/razorpay';
import { getShippingProvider } from '@/lib/shipping';
import { Order, OrderItem } from '@/types/database';

// ----------------------------------------------------------------------
// VALIDATION SCHEMAS
// ----------------------------------------------------------------------

const checkoutItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid('Invalid variant ID').optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(50, 'Max 50 items per line'),
});

const checkoutFormSchema = z.object({
  customerName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  customerPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  customerEmail: z.string().trim().email('Please enter a valid email address'),
  shippingAddressLine1: z.string().trim().min(5, 'Address must be at least 5 characters'),
  shippingAddressLine2: z.string().trim().optional(),
  shippingCity: z.string().trim().min(2, 'City is required'),
  shippingState: z.string().trim().min(2, 'State is required'),
  shippingPincode: z.string().trim().regex(/^\d{6}$/, 'Please enter a valid 6-digit Indian PIN code'),
  shippingCountry: z.string().trim().default('India'),
  customerNotes: z.string().trim().max(300, 'Notes cannot exceed 300 characters').optional(),
  items: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
});

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;

/**
 * Creates a server-verified pending order and initializes a Razorpay order
 */
export async function createCheckoutSessionAction(formData: CheckoutFormInput) {
  try {
    const validated = checkoutFormSchema.parse(formData);
    const supabase = await createServerSupabase();

    // 1. Fetch live product and variant pricing from Supabase (NEVER TRUST CLIENT PRICES)
    const productIds = validated.items.map((i) => i.productId);
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .in('id', productIds)
      .eq('is_published', true);

    if (prodError || !dbProducts || dbProducts.length === 0) {
      return { success: false, error: 'Failed to retrieve product details or products are unavailable' };
    }

    // 2. Validate availability and recalculate authoritative totals
    let calculatedSubtotal = 0;
    const orderItemsToInsert: Array<Omit<OrderItem, 'id' | 'order_id' | 'created_at'>> = [];

    for (const item of validated.items) {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) {
        return { success: false, error: `Product not found or currently unavailable` };
      }

      let unitPrice = product.selling_price || 0;
      let variantTitle: string | null = null;
      let sku = product.sku;
      let weight = product.weight || product.pack_size;

      if (item.variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.find((v: { id: string }) => v.id === item.variantId);
        if (!variant || !variant.is_active) {
          return { success: false, error: `Selected variant for ${product.name} is no longer active` };
        }
        unitPrice = variant.selling_price || unitPrice;
        variantTitle = variant.title;
        sku = variant.sku || sku;
        weight = variant.pack_size || weight;
      }

      if (unitPrice <= 0) {
        return { success: false, error: `Invalid pricing for ${product.name}` };
      }

      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      orderItemsToInsert.push({
        product_id: product.id,
        variant_id: item.variantId || null,
        product_name_snapshot: product.name,
        variant_title_snapshot: variantTitle,
        sku_snapshot: sku || null,
        image_url_snapshot: product.primary_image_url || null,
        weight_snapshot: weight || null,
        unit_price: unitPrice,
        quantity: item.quantity,
        line_total: lineTotal,
      });
    }

    // 3. Shipping calculation (Standard flat rate of ₹60, or Free over ₹499)
    const shippingAmount = calculatedSubtotal >= 499 ? 0.0 : 60.0;
    const taxAmount = 0.0; // Inclusive in product MRP/selling price
    const totalAmount = calculatedSubtotal + shippingAmount;

    // 4. Generate unique readable order number
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `DFB-${timestamp}-${randomSuffix}`;

    // 5. Insert pending internal order
    const orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'items' | 'payments' | 'shipments'> = {
      order_number: orderNumber,
      customer_name: validated.customerName,
      customer_phone: validated.customerPhone,
      customer_email: validated.customerEmail,
      shipping_address_line1: validated.shippingAddressLine1,
      shipping_address_line2: validated.shippingAddressLine2 || null,
      shipping_city: validated.shippingCity,
      shipping_state: validated.shippingState,
      shipping_pincode: validated.shippingPincode,
      shipping_country: validated.shippingCountry,
      subtotal_amount: calculatedSubtotal,
      shipping_amount: shippingAmount,
      tax_amount: taxAmount,
      discount_amount: 0.0,
      total_amount: totalAmount,
      currency: 'INR',
      status: 'payment_pending',
      payment_status: 'pending',
      shipping_status: 'unfulfilled',
      payment_method: 'razorpay',
      razorpay_order_id: null,
      razorpay_payment_id: null,
      customer_notes: validated.customerNotes || null,
      internal_notes: null,
    };

    const orderRes = await createPendingOrder(orderData, orderItemsToInsert);
    if (!orderRes.success || !orderRes.data) {
      return { success: false, error: orderRes.error || 'Failed to create internal order record' };
    }

    const internalOrder = orderRes.data;

    // 6. Initialize Razorpay order (amount in paise)
    const amountPaise = Math.round(totalAmount * 100);
    const rzpRes = await createRazorpayOrder({
      amountPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        order_id: internalOrder.id,
        order_number: orderNumber,
        customer_phone: validated.customerPhone,
      },
    });

    if (!rzpRes.success || !rzpRes.data) {
      return { success: false, error: rzpRes.error || 'Failed to initialize payment gateway' };
    }

    // 7. Update order with Razorpay Order ID
    await supabase
      .from('orders')
      .update({ razorpay_order_id: rzpRes.data.id })
      .eq('id', internalOrder.id);

    const { keyId } = getRazorpayConfig();

    return {
      success: true,
      orderId: internalOrder.id,
      orderNumber,
      razorpayOrderId: rzpRes.data.id,
      amountPaise,
      currency: 'INR',
      keyId,
      customerDetails: {
        name: validated.customerName,
        email: validated.customerEmail,
        phone: validated.customerPhone,
      },
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Validation error' };
    }
    return { success: false, error: err instanceof Error ? err.message : 'Checkout failed' };
  }
}

/**
 * Server-side payment verification called after customer completes Razorpay checkout modal
 */
export async function verifyPaymentAction(params: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  try {
    const supabase = await createServerSupabase();

    // 1. Fetch internal order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', params.orderId)
      .single();

    if (orderErr || !order) {
      return { success: false, error: 'Order not found' };
    }

    // 2. Verify signature using timing-safe HMAC-SHA256
    const isSignatureValid = verifyPaymentSignature({
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      razorpaySignature: params.razorpaySignature,
    });

    if (!isSignatureValid) {
      await recordIntegrationLog(
        'razorpay',
        'verify_payment_failed',
        'failed',
        params,
        null,
        'Invalid payment signature'
      );
      return { success: false, error: 'Payment signature verification failed' };
    }

    // 3. Mark internal order as PAID
    const paymentUpdate = await updateOrderPaymentSuccess(params.orderId, {
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      razorpaySignature: params.razorpaySignature,
      amount: order.total_amount,
      currency: order.currency || 'INR',
    });

    if (!paymentUpdate.success) {
      return { success: false, error: paymentUpdate.error || 'Failed to update order status' };
    }

    // 4. Trigger shipment creation asynchronously (Shiprocket)
    // ONLY triggered AFTER payment has been verified
    await triggerShipmentCreation(order);

    return {
      success: true,
      orderNumber: order.order_number,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Verification error' };
  }
}

/**
 * Creates shipment with active shipping provider (Shiprocket / Manual)
 */
async function triggerShipmentCreation(order: Order) {
  try {
    const shippingProvider = getShippingProvider();

    const shipmentResult = await shippingProvider.createShipment({
      orderId: order.order_number,
      recipient: {
        name: order.customer_name,
        phone: order.customer_phone,
        email: order.customer_email,
        addressLine1: order.shipping_address_line1,
        addressLine2: order.shipping_address_line2 || undefined,
        city: order.shipping_city,
        state: order.shipping_state,
        pincode: order.shipping_pincode,
        country: order.shipping_country,
      },
      items: (order.items || []).map((i) => ({
        sku: i.sku_snapshot || `SKU-${i.product_name_snapshot}`,
        name: i.product_name_snapshot,
        quantity: i.quantity,
        priceINR: i.unit_price,
      })),
      totalWeightGrams: 500,
      isCOD: false,
    });

    if (shipmentResult.success) {
      await recordShipment({
        order_id: order.id,
        provider: 'shiprocket',
        shiprocket_order_id: shipmentResult.trackingNumber || null,
        shiprocket_shipment_id: null,
        awb_code: shipmentResult.trackingNumber || null,
        courier_name: shipmentResult.carrierName || 'Shiprocket Courier',
        courier_id: null,
        tracking_url: shipmentResult.trackingUrl || null,
        label_url: shipmentResult.labelUrl || null,
        manifest_url: null,
        pickup_location: 'Primary',
        pickup_scheduled_date: null,
        status: shipmentResult.status,
        error_details: null,
      });

      await recordIntegrationLog(
        'shiprocket',
        'create_shipment',
        'success',
        { orderId: order.order_number },
        shipmentResult as unknown as Record<string, unknown>
      );
    } else {
      // If shipping provider is temporarily unavailable, record error, keep order PAID
      await recordShipment({
        order_id: order.id,
        provider: 'shiprocket',
        shiprocket_order_id: null,
        shiprocket_shipment_id: null,
        awb_code: null,
        courier_name: null,
        courier_id: null,
        tracking_url: null,
        label_url: null,
        manifest_url: null,
        pickup_location: null,
        pickup_scheduled_date: null,
        status: 'shipping_failed',
        error_details: shipmentResult.error || 'Shipment creation failed',
      });

      await recordIntegrationLog(
        'shiprocket',
        'create_shipment',
        'failed',
        { orderId: order.order_number },
        null,
        shipmentResult.error
      );
    }
  } catch (err: unknown) {
    console.error('Shipment creation error:', err);
    await recordIntegrationLog(
      'shiprocket',
      'create_shipment',
      'failed',
      { orderId: order.order_number },
      null,
      err instanceof Error ? err.message : 'Unknown shipping exception'
    );
  }
}

/**
 * Public Order Tracking Lookup (Protected by Order Number + Phone validation)
 */
export async function lookupOrderAction(orderNumber: string, phone: string) {
  try {
    if (!orderNumber || !phone) {
      return { success: false, error: 'Please provide both Order Number and Mobile Number' };
    }

    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);

    const order = await getOrderByNumber(cleanOrderNumber);
    if (!order) {
      return { success: false, error: 'No order found with the provided details' };
    }

    const orderPhone = order.customer_phone.replace(/\D/g, '').slice(-10);
    if (orderPhone !== cleanPhone) {
      return { success: false, error: 'Mobile number does not match this order' };
    }

    // Return sanitized public tracking details
    return {
      success: true,
      order: {
        order_number: order.order_number,
        customer_name: order.customer_name,
        created_at: order.created_at,
        status: order.status,
        payment_status: order.payment_status,
        shipping_status: order.shipping_status,
        total_amount: order.total_amount,
        shipping_city: order.shipping_city,
        shipping_state: order.shipping_state,
        shipping_pincode: order.shipping_pincode,
        items: (order.items || []).map((i) => ({
          name: i.product_name_snapshot,
          variant: i.variant_title_snapshot,
          quantity: i.quantity,
          unit_price: i.unit_price,
          line_total: i.line_total,
        })),
        shipment: order.shipments && order.shipments.length > 0 ? {
          courier_name: order.shipments[0].courier_name,
          awb_code: order.shipments[0].awb_code,
          tracking_url: order.shipments[0].tracking_url,
          status: order.shipments[0].status,
        } : null,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Lookup failed' };
  }
}

/**
 * Admin action: Retry failed shipment creation for a paid order
 */
export async function retryOrderShipmentAction(orderId: string) {
  try {
    const supabase = await createServerSupabase();
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.payment_status !== 'paid') {
      return { success: false, error: 'Cannot create shipment for unpaid order' };
    }

    await triggerShipmentCreation(order);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Retry failed' };
  }
}
