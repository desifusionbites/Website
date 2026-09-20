import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import {
  updateOrderPaymentSuccess,
  recordIntegrationLog,
  recordShipment,
} from '@/lib/db';
import { getShippingProvider } from '@/lib/shipping';
import { OrderItem } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      await recordIntegrationLog(
        'razorpay',
        'webhook_signature_invalid',
        'failed',
        { signature },
        null,
        'Invalid Razorpay webhook signature'
      );
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;

    if (!razorpayOrderId) {
      return NextResponse.json({ received: true, ignored: true, reason: 'No order ID in payload' });
    }

    const supabase = await createServerSupabase();

    // Find internal order by razorpay_order_id
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('razorpay_order_id', razorpayOrderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ received: true, ignored: true, reason: 'Order not found in DB' });
    }

    // Handle payment successful events
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      // Idempotency check: if order is already paid, do not re-trigger
      if (order.payment_status === 'paid') {
        return NextResponse.json({ received: true, status: 'already_processed' });
      }

      await updateOrderPaymentSuccess(order.id, {
        razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId || `pay_${Date.now()}`,
        amount: order.total_amount,
        currency: order.currency || 'INR',
        method: paymentEntity?.method || 'online',
        rawPayload: event,
      });

      // Trigger Shiprocket shipment creation safely
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
          items: (order.items || []).map((i: OrderItem) => ({
            sku: i.sku_snapshot || `SKU-${i.product_name_snapshot}`,
            name: i.product_name_snapshot,
            quantity: i.quantity,
            priceINR: i.unit_price,
          })),
          totalWeightGrams: 500,
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
        }
      } catch (shipErr) {
        console.error('Webhook shipment creation error:', shipErr);
      }

      await recordIntegrationLog(
        'razorpay',
        'webhook_payment_captured',
        'success',
        { eventType, orderId: order.order_number, razorpayOrderId },
        event
      );
    } else if (eventType === 'payment.failed') {
      await supabase
        .from('orders')
        .update({
          status: 'payment_failed',
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      await recordIntegrationLog(
        'razorpay',
        'webhook_payment_failed',
        'failed',
        { eventType, orderId: order.order_number },
        event,
        paymentEntity?.error_description || 'Payment failed'
      );
    }

    return NextResponse.json({ received: true, status: 'processed' });
  } catch (err: unknown) {
    console.error('Razorpay webhook handler exception:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook error' },
      { status: 500 }
    );
  }
}
