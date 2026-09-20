import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Phone,
  Mail,
  ShoppingBag,
} from 'lucide-react';
import { getOrderByNumber } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-sand-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 stroke-[2]" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment Verified &amp; Order Confirmed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal pt-2">
            Thank you, {order.customer_name}!
          </h1>
          <p className="text-sm sm:text-base text-sand-600 max-w-md mx-auto">
            Your order has been received and is being prepared for dispatch via Shiprocket.
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 bg-sand-50 px-5 py-2.5 rounded-xl border border-sand-200 text-sm">
          <span className="text-sand-600">Order Reference:</span>
          <strong className="font-mono text-charcoal font-bold">{order.order_number}</strong>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Details */}
        <div className="bg-white p-6 rounded-2xl border border-sand-200 space-y-3">
          <h2 className="font-serif font-bold text-base text-charcoal flex items-center space-x-2">
            <Truck className="w-4 h-4 text-saffron" />
            <span>Delivery Information</span>
          </h2>
          <div className="text-xs sm:text-sm text-sand-700 space-y-1">
            <p className="font-bold text-charcoal">{order.customer_name}</p>
            <p>{order.shipping_address_line1}</p>
            {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
            <p>
              {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
            </p>
            <p>{order.shipping_country}</p>
            <div className="pt-2 text-xs text-sand-500">
              <p>Phone: +91 {order.customer_phone}</p>
              <p>Email: {order.customer_email}</p>
            </div>
          </div>
        </div>

        {/* Payment & Status Summary */}
        <div className="bg-white p-6 rounded-2xl border border-sand-200 space-y-3">
          <h2 className="font-serif font-bold text-base text-charcoal flex items-center space-x-2">
            <Package className="w-4 h-4 text-saffron" />
            <span>Payment Summary</span>
          </h2>
          <div className="text-xs sm:text-sm text-sand-700 space-y-2">
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className="font-bold text-emerald-700 uppercase">{order.payment_status}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-semibold text-charcoal">Razorpay (Online)</span>
            </div>
            {order.razorpay_payment_id && (
              <div className="flex justify-between text-xs text-sand-500">
                <span>Transaction Ref:</span>
                <span className="font-mono">{order.razorpay_payment_id}</span>
              </div>
            )}
            <div className="pt-2 border-t border-sand-200 flex justify-between items-baseline">
              <span className="font-bold text-charcoal">Total Paid:</span>
              <span className="font-serif font-bold text-lg text-saffron">
                ₹{order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Item Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-sand-200 space-y-4">
        <h2 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-saffron" />
          <span>Items Ordered ({order.items?.length || 0})</span>
        </h2>

        <div className="divide-y divide-sand-100">
          {(order.items || []).map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-center text-sm">
              <div>
                <p className="font-bold text-charcoal">{item.product_name_snapshot}</p>
                {item.variant_title_snapshot && (
                  <p className="text-xs text-sand-600">Variant: {item.variant_title_snapshot}</p>
                )}
                <p className="text-xs text-sand-500">
                  Qty: {item.quantity} × ₹{item.unit_price.toFixed(2)}
                </p>
              </div>
              <div className="font-bold text-charcoal">
                ₹{item.line_total.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons & Customer Support */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-sand-50 rounded-2xl border border-sand-200">
        <div className="space-y-1 text-xs text-sand-600 text-center sm:text-left">
          <p className="font-bold text-charcoal">Questions about your order?</p>
          <div className="flex items-center space-x-3 justify-center sm:justify-start pt-0.5">
            <span className="flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-saffron" />
              <span>9051941774</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-saffron" />
              <span>desifusionbites@gmail.com</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link
            href={`/track-order?order=${order.order_number}&phone=${order.customer_phone}`}
            className="btn-primary flex-1 sm:flex-none text-center text-xs py-3 px-5 flex items-center justify-center space-x-1.5"
          >
            <span>Track Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/products"
            className="btn-secondary flex-1 sm:flex-none text-center text-xs py-3 px-5"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
