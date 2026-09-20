import React from 'react';
import { requireRole } from '@/lib/auth';
import { getOrders } from '@/lib/db';
import { AdminOrderTable } from '@/components/admin/AdminOrderTable';
import { ShoppingBag, TrendingUp, PackageCheck, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(['owner', 'admin', 'staff']);
  const { status } = await searchParams;
  const orders = await getOrders(status || 'all');

  // Compute stats across all orders
  const allOrders = await getOrders('all');
  const totalRevenue = allOrders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const paidCount = allOrders.filter((o) => o.payment_status === 'paid').length;
  const pendingShipmentCount = allOrders.filter(
    (o) => o.payment_status === 'paid' && ['pending', 'unfulfilled', 'created'].includes(o.shipping_status)
  ).length;
  const needsAttentionCount = allOrders.filter((o) =>
    ['payment_failed', 'shipping_failed'].includes(o.status)
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Orders &amp; Sales Management
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Monitor prepaid orders, verify Razorpay payments, and track Shiprocket courier fulfillment.
        </p>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase">
            <span>Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif font-bold text-2xl text-stone-900">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-stone-500">From {paidCount} verified paid orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase">
            <span>Paid Orders</span>
            <ShoppingBag className="w-4 h-4 text-saffron" />
          </div>
          <p className="font-serif font-bold text-2xl text-stone-900">{paidCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium">Prepaid via Razorpay</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase">
            <span>Pending Dispatch</span>
            <PackageCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-serif font-bold text-2xl text-stone-900">{pendingShipmentCount}</p>
          <p className="text-[11px] text-stone-500">Awaiting courier pickup</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold uppercase">
            <span>Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif font-bold text-2xl text-stone-900">{needsAttentionCount}</p>
          <p className="text-[11px] text-amber-600 font-medium">Failed payments / shipments</p>
        </div>
      </div>

      {/* Orders Table Component */}
      <AdminOrderTable initialOrders={orders} currentStatus={status || 'all'} />
    </div>
  );
}
