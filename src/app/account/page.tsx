import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { Package, ShoppingBag, Shield, ArrowRight, Truck, Mail, Calendar } from 'lucide-react';
import { SignOutButton } from '@/components/admin/SignOutButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CustomerAccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/account');
  }

  const profile = await getCurrentProfile();

  // Fetch recent customer orders matching this email
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total_amount, status, payment_status, shipping_status, created_at')
    .eq('customer_email', user.email)
    .order('created_at', { ascending: false })
    .limit(5);

  const totalOrders = orders?.length || 0;
  const recentOrders = orders || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header Profile Greeting */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-spice-800 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                {profile?.full_name || 'Valued Customer'}
              </h1>
              {profile?.role === 'owner' || profile?.role === 'admin' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-100 text-brand-800 border border-brand-300">
                  {profile.role}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>{user.email}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Member since {new Date(user.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {profile?.role === 'owner' || profile?.role === 'admin' || profile?.role === 'staff' ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Admin CMS</span>
            </Link>
          ) : null}
          <div className="w-full sm:w-auto">
            <SignOutButton
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-sand-300 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-stone-700 text-xs font-semibold shadow-xs transition-colors w-full"
              showLabel={true}
            />
          </div>
        </div>
      </div>

      {/* Quick Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
            <span>Orders Placed</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900">{totalOrders}</div>
          <p className="text-xs text-stone-500 pt-1 border-t border-sand-100">
            Prepaid orders completed on Desi Fusion Bites
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
            <span>Shipment Tracking</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-emerald-800">Direct Logistics</div>
          <Link
            href="/track-order"
            className="text-xs text-brand-700 hover:underline font-semibold block pt-2 border-t border-sand-100"
          >
            Track with Phone / AWB →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
            <span>Customer Support</span>
            <div className="w-8 h-8 rounded-lg bg-sand-100 text-stone-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-stone-900">Need Help with Order?</div>
          <Link
            href="/contact"
            className="text-xs text-brand-700 hover:underline font-semibold block pt-2 border-t border-sand-100"
          >
            WhatsApp Support & FAQs →
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-sand-200 pb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Your Recent Orders
            </h2>
            <p className="text-xs text-stone-500">
              Review order history, payment status, and delivery tracking.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1 hover:underline"
          >
            <span>Shop More Snacks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-sand-100">
            {recentOrders.map((ord) => (
              <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900 text-sm">{ord.order_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      ord.status === 'paid' || ord.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sand-200 text-stone-700'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-stone-500">
                    Placed on {new Date(ord.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-stone-900 text-sm">₹{Number(ord.total_amount).toFixed(2)}</div>
                    <div className="text-[11px] text-stone-500 capitalize">{ord.shipping_status || 'Processing'}</div>
                  </div>
                  <Link
                    href={`/order-confirmation/${ord.order_number}`}
                    className="px-3 py-1.5 bg-sand-100 hover:bg-sand-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors shrink-0"
                  >
                    View Receipt
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-sand-100 text-stone-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-stone-700">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow transition-colors"
            >
              <span>Explore Our Snacks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
