'use client';

import React, { useState, Suspense } from 'react';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Package,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { lookupOrderAction } from '@/lib/actions/checkout';

interface TrackingOrder {
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  shipping_status: string;
  shipping_city: string;
  shipping_state: string;
  customer_name?: string;
  total_amount?: number;
  items?: Array<{
    name: string;
    variant?: string | null;
    quantity: number;
  }>;
  shipment?: {
    courier_name?: string | null;
    awb_code?: string | null;
    tracking_url?: string | null;
    status?: string | null;
  } | null;
}

function TrackOrderContent() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackingOrder | null>(null);

  const handleLookup = async (lookupOrderNum: string, lookupPhone: string) => {
    setError(null);
    setIsSearching(true);

    try {
      const res = await lookupOrderAction(lookupOrderNum, lookupPhone);
      if (res.success && res.order) {
        setOrder(res.order as TrackingOrder);
      } else {
        setError(res.error || 'Order not found. Please check the details and try again.');
        setOrder(null);
      }
    } catch {
      setError('Failed to query order tracking details. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError('Please enter both your Order Number and registered Mobile Number.');
      return;
    }
    handleLookup(orderNumber, phone);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-saffron/10 text-saffron flex items-center justify-center mx-auto shadow-xs">
          <Truck className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Track Your Order
        </h1>
        <p className="text-sm sm:text-base text-sand-600 max-w-md mx-auto">
          Enter your Order Reference Number and registered 10-digit mobile number to check real-time status.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-sm max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Order Number *
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. DFB-M12345-ABCD"
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:ring-2 focus:ring-saffron/40 focus:border-saffron text-sm bg-sand-50/50 uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Registered Mobile Number *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-sand-300 bg-sand-100 text-sand-700 text-sm font-semibold">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9051941774"
                className="w-full px-4 py-2.5 rounded-r-xl border border-sand-300 focus:ring-2 focus:ring-saffron/40 focus:border-saffron text-sm bg-sand-50/50"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSearching}
            className="btn-primary w-full py-3.5 flex items-center justify-center space-x-2 text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Status...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Order</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Tracking Results Card */}
      {order && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-sm space-y-8 animate-in fade-in-50">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-sand-200">
            <div>
              <span className="text-xs text-sand-500">Order Reference</span>
              <h2 className="font-mono text-xl font-bold text-charcoal">{order.order_number}</h2>
              <p className="text-xs text-sand-600 mt-0.5">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Payment: {order.payment_status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sand-100 text-sand-800">
                Fulfillment: {order.shipping_status || order.status}
              </span>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal">Fulfillment Progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Confirmed</span>
                </div>
                <p className="text-[11px] text-emerald-900">Prepaid &amp; Logged</p>
              </div>

              <div className={`p-4 rounded-xl border space-y-1 ${
                ['processing', 'shipment_pending', 'shipped', 'delivered'].includes(order.status)
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-sand-50 border-sand-200 text-sand-600'
              }`}>
                <div className="flex items-center space-x-1.5 font-bold text-xs">
                  <Clock className="w-4 h-4 text-saffron" />
                  <span>2. Processing</span>
                </div>
                <p className="text-[11px]">Preparing Fresh Batch</p>
              </div>

              <div className={`p-4 rounded-xl border space-y-1 ${
                ['shipped', 'delivered'].includes(order.status)
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-sand-50 border-sand-200 text-sand-600'
              }`}>
                <div className="flex items-center space-x-1.5 font-bold text-xs">
                  <Truck className="w-4 h-4 text-saffron" />
                  <span>3. Dispatched</span>
                </div>
                <p className="text-[11px]">Handed to Courier</p>
              </div>

              <div className={`p-4 rounded-xl border space-y-1 ${
                order.status === 'delivered'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-sand-50 border-sand-200 text-sand-600'
              }`}>
                <div className="flex items-center space-x-1.5 font-bold text-xs">
                  <Package className="w-4 h-4 text-saffron" />
                  <span>4. Delivered</span>
                </div>
                <p className="text-[11px]">Direct to Doorstep</p>
              </div>
            </div>
          </div>

          {/* Courier & AWB Details if available */}
          {order.shipment && (order.shipment.awb_code || order.shipment.courier_name) && (
            <div className="p-5 rounded-2xl bg-sand-50 border border-sand-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-saffron">
                  Courier Partner
                </span>
                <p className="font-bold text-charcoal text-base">
                  {order.shipment.courier_name || 'Shiprocket Partner'}
                </p>
                {order.shipment.awb_code && (
                  <p className="text-xs font-mono text-sand-600">
                    AWB Tracking Code: <strong>{order.shipment.awb_code}</strong>
                  </p>
                )}
              </div>

              {order.shipment.tracking_url && (
                <a
                  href={order.shipment.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xs py-2.5 px-4 flex items-center space-x-1.5"
                >
                  <span>Live Courier Tracking</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Items Preview */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="font-serif font-bold text-base text-charcoal">Package Contents</h3>
              <div className="divide-y divide-sand-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-charcoal">{item.name}</span>
                      {item.variant && (
                        <span className="text-sand-600 ml-1.5">({item.variant})</span>
                      )}
                    </div>
                    <span className="font-semibold text-sand-600">Qty: {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-saffron" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
