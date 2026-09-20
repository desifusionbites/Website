'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Truck,
  CreditCard,
  User,
  ShoppingBag,
  ExternalLink,
  RotateCw,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/database';
import { updateOrderAdminAction } from '@/lib/actions/orders';
import { retryOrderShipmentAction } from '@/lib/actions/checkout';
import { generateWhatsAppLink } from '@/lib/utils';

interface AdminOrderDetailsProps {
  order: Order;
}

export function AdminOrderDetails({ order: initialOrder }: AdminOrderDetailsProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [internalNotes, setInternalNotes] = useState(order.internal_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRetryingShipping, setIsRetryingShipping] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shipment = order.shipments?.[0];
  const payment = order.payments?.[0];

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const res = await updateOrderAdminAction(order.id, {
      status,
      internal_notes: internalNotes,
    });

    if (res.success) {
      setSuccessMessage('Order status and internal notes updated successfully.');
      setOrder((prev) => ({ ...prev, status, internal_notes: internalNotes }));
    } else {
      setErrorMessage(res.error || 'Failed to update order');
    }
    setIsUpdating(false);
  };

  const handleRetryShipping = async () => {
    setIsRetryingShipping(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const res = await retryOrderShipmentAction(order.id);
    if (res.success) {
      setSuccessMessage('Shipment creation triggered successfully with Shiprocket.');
    } else {
      setErrorMessage(res.error || 'Failed to retry shipment creation.');
    }
    setIsRetryingShipping(false);
  };

  const whatsAppLink = generateWhatsAppLink(
    order.customer_phone,
    `Hello ${order.customer_name}, this is regarding your Desi Fusion Bites Order ${order.order_number}.`
  );

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Orders List
        </Link>
        <span className="text-xs font-mono text-stone-400">Order ID: {order.id}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-stone-900">
              {order.order_number}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
              Payment: {order.payment_status}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Placed on{' '}
            {new Date(order.created_at).toLocaleDateString('en-IN', {
              dateStyle: 'full',
              timeStyle: 'medium',
            })}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Items & Delivery */}
        <div className="lg:col-span-8 space-y-6">
          {/* Items Table */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-saffron" />
              <span>Purchased Items Snapshot</span>
            </h2>

            <div className="divide-y divide-stone-100 overflow-x-auto">
              {(order.items || []).map((item) => (
                <div key={item.id} className="py-4 flex justify-between items-center gap-4 text-xs sm:text-sm">
                  <div className="space-y-0.5">
                    <p className="font-bold text-stone-900">{item.product_name_snapshot}</p>
                    {item.variant_title_snapshot && (
                      <p className="text-xs text-stone-500">Variant: {item.variant_title_snapshot}</p>
                    )}
                    {item.sku_snapshot && (
                      <p className="text-[11px] font-mono text-stone-400">SKU: {item.sku_snapshot}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-stone-900">₹{Number(item.line_total).toFixed(2)}</p>
                    <p className="text-stone-500 text-xs">
                      {item.quantity} × ₹{Number(item.unit_price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="pt-4 border-t border-stone-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping Charges</span>
                <span>₹{Number(order.shipping_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Tax &amp; GST</span>
                <span>₹{Number(order.tax_amount).toFixed(2)} (Inclusive)</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-bold text-base text-stone-900">
                <span>Total Amount Paid</span>
                <span className="font-serif text-xl text-saffron">
                  ₹{Number(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <User className="w-5 h-5 text-saffron" />
              <span>Customer &amp; Shipping Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm text-stone-700">
              <div className="space-y-1.5">
                <p className="font-bold text-stone-900 text-base">{order.customer_name}</p>
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <a href={`tel:${order.customer_phone}`} className="hover:underline">
                    +91 {order.customer_phone}
                  </a>
                </div>
                <p className="text-stone-500">{order.customer_email}</p>
                {order.customer_notes && (
                  <div className="p-3 mt-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <strong>Customer Instructions:</strong> {order.customer_notes}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-stone-900 uppercase text-xs tracking-wider text-stone-500">
                  Destination:
                </p>
                <p>{order.shipping_address_line1}</p>
                {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                <p>
                  {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
                </p>
                <p className="font-semibold">{order.shipping_country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Fulfillment Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Status Management Form */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900">Manage Status</h2>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Fulfillment Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50 focus:ring-2 focus:ring-saffron/40"
                >
                  <option value="payment_pending">Payment Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing (Preparing batch)</option>
                  <option value="shipment_pending">Shipment Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="shipping_failed">Shipping Failed / Needs Attention</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Internal Staff Notes
                </label>
                <textarea
                  rows={3}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="e.g. Dispatched with batch #42, tracking SMS sent to client..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-saffron/40"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </form>
          </div>

          {/* Shiprocket Logistics Details */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-saffron" />
                <span>Shiprocket Logistics</span>
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                {order.shipping_status || 'Unfulfilled'}
              </span>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-500">Courier Partner:</span>
                <span className="font-bold text-stone-900">
                  {shipment?.courier_name || 'Shiprocket (Not Assigned)'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">AWB Code:</span>
                <span className="font-mono font-bold text-stone-900">
                  {shipment?.awb_code || 'Pending'}
                </span>
              </div>

              {shipment?.error_details && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[11px] space-y-1">
                  <strong>Shipment Error:</strong>
                  <p>{shipment.error_details}</p>
                </div>
              )}

              {/* Retry Shipping Button */}
              {order.payment_status === 'paid' && (
                <button
                  type="button"
                  onClick={handleRetryShipping}
                  disabled={isRetryingShipping}
                  className="w-full py-2 px-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRetryingShipping ? 'animate-spin' : ''}`} />
                  <span>Retry Shiprocket Shipment</span>
                </button>
              )}

              {shipment?.tracking_url && (
                <a
                  href={shipment.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-saffron/10 hover:bg-saffron/20 text-saffron text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Open Tracking Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Payment Details Snapshot */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-saffron" />
              <span>Payment Details</span>
            </h2>

            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-500">Gateway:</span>
                <span className="font-bold uppercase">Razorpay</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Status:</span>
                <span className="font-bold text-emerald-700 uppercase">
                  {order.payment_status}
                </span>
              </div>
              {order.razorpay_order_id && (
                <div className="space-y-0.5">
                  <span className="text-stone-500">Razorpay Order ID:</span>
                  <p className="font-mono text-stone-900 text-[11px] truncate">
                    {order.razorpay_order_id}
                  </p>
                </div>
              )}
              {order.razorpay_payment_id && (
                <div className="space-y-0.5">
                  <span className="text-stone-500">Razorpay Payment ID:</span>
                  <p className="font-mono text-stone-900 text-[11px] truncate">
                    {order.razorpay_payment_id}
                  </p>
                </div>
              )}
              {payment?.method && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Method:</span>
                  <span className="font-semibold text-stone-900">{payment.method}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
