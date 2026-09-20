'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowUpRight,
  Truck,
  CreditCard,
  User,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { Order } from '@/types/database';

interface AdminOrderTableProps {
  initialOrders: Order[];
  currentStatus: string;
}

const STATUS_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'paid', label: 'Paid' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipment_pending', label: 'Shipment Pending' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'payment_pending', label: 'Payment Pending' },
  { id: 'needs_attention', label: 'Needs Attention' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function AdminOrderTable({ initialOrders, currentStatus }: AdminOrderTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = initialOrders.filter((order) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const awb = order.shipments?.[0]?.awb_code?.toLowerCase() || '';
    return (
      order.order_number.toLowerCase().includes(term) ||
      order.customer_name.toLowerCase().includes(term) ||
      order.customer_phone.toLowerCase().includes(term) ||
      order.customer_email.toLowerCase().includes(term) ||
      (order.razorpay_order_id && order.razorpay_order_id.toLowerCase().includes(term)) ||
      (order.razorpay_payment_id && order.razorpay_payment_id.toLowerCase().includes(term)) ||
      awb.includes(term)
    );
  });

  const handleTabChange = (statusId: string) => {
    if (statusId === 'all') {
      router.push('/admin/orders');
    } else {
      router.push(`/admin/orders?status=${statusId}`);
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'authorized':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const getShippingBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'shipped':
      case 'in_transit':
      case 'out_for_delivery':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'created':
      case 'pickup_scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden space-y-6">
      {/* Top Filter Tabs & Search */}
      <div className="p-6 pb-0 space-y-4">
        {/* Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
          {STATUS_TABS.map((tab) => {
            const isActive = currentStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order #, Customer, Phone, Razorpay ID, or AWB..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-saffron/40 focus:border-saffron text-xs bg-stone-50"
            />
          </div>
          <span className="text-xs text-stone-500 font-medium">
            Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-stone-700">
          <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-y border-stone-200 text-[11px]">
            <tr>
              <th className="py-3 px-6">Order Reference</th>
              <th className="py-3 px-6">Customer</th>
              <th className="py-3 px-6">Items &amp; Total</th>
              <th className="py-3 px-6">Payment</th>
              <th className="py-3 px-6">Fulfillment</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-stone-400">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-2 text-stone-400">
                    <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <p className="font-semibold text-stone-600">No orders found</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {searchTerm ? 'Try changing your search term.' : 'New orders will appear here automatically.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const shipment = order.shipments?.[0];
                return (
                  <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Order Reference */}
                    <td className="py-4 px-6 align-top">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono font-bold text-stone-900 hover:text-saffron flex items-center gap-1 group"
                      >
                        <span>{order.order_number}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-6 align-top space-y-0.5">
                      <div className="font-bold text-stone-900 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{order.customer_name}</span>
                      </div>
                      <p className="text-stone-600">+91 {order.customer_phone}</p>
                      <p className="text-stone-400 text-[11px] truncate max-w-[160px]">
                        {order.customer_email}
                      </p>
                    </td>

                    {/* Items & Total */}
                    <td className="py-4 px-6 align-top space-y-0.5">
                      <p className="font-bold text-stone-900 font-serif text-sm">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </p>
                      <p className="text-stone-500 text-[11px]">
                        {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                      </p>
                      <p className="text-stone-400 text-[10px] truncate max-w-[180px]">
                        {order.items?.map((i) => i.product_name_snapshot).join(', ')}
                      </p>
                    </td>

                    {/* Payment */}
                    <td className="py-4 px-6 align-top space-y-1">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPaymentBadge(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-stone-500">
                        <CreditCard className="w-3 h-3 text-stone-400" />
                        <span>{order.payment_method}</span>
                      </div>
                      {order.razorpay_payment_id && (
                        <p className="text-[10px] font-mono text-stone-400 truncate max-w-[120px]">
                          {order.razorpay_payment_id}
                        </p>
                      )}
                    </td>

                    {/* Fulfillment & Shiprocket */}
                    <td className="py-4 px-6 align-top space-y-1">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getShippingBadge(
                          order.shipping_status || order.status
                        )}`}
                      >
                        {order.shipping_status || order.status}
                      </span>
                      {shipment?.awb_code ? (
                        <div className="text-[11px] font-mono text-stone-600 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-saffron" />
                          <span>AWB: {shipment.awb_code}</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-stone-400">No AWB yet</p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 align-top text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors"
                      >
                        <span>Manage</span>
                        <ExternalLink className="w-3 h-3 text-stone-500" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
