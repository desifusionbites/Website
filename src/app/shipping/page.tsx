import React from 'react';
import type { Metadata } from 'next';
import { getWebsiteSettings } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy',
  description: 'Shipping and Delivery policy for Desi Fusion Bites.',
};

export default async function ShippingPolicyPage() {
  const settings = await getWebsiteSettings();

  return (
    <div className="bg-sand-50/50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-sand-200 shadow-xs space-y-6 text-stone-800 text-sm leading-relaxed">
        <h1 className="font-serif text-3xl font-bold text-stone-900 border-b border-sand-200 pb-4">
          Shipping & Delivery Policy
        </h1>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">1. Dispatch & Processing Time</h2>
          <p>
            All retail orders from {settings.brand_name || 'Desi Fusion Bites'} are dispatched within 1 to 2 business days following order confirmation to ensure freshness. Wholesale freight orders are scheduled according to production batch volumes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">2. Logistics Partners & Coverage</h2>
          <p>
            We ship across India through reputed third-party logistics and courier partners. Delivery typically takes 3 to 7 business days depending on destination pincode and state connectivity.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">3. Tracking Your Shipment</h2>
          <p>
            Once your order is dispatched, a tracking number and courier tracking link will be shared with you via WhatsApp or SMS.
          </p>
        </section>
      </div>
    </div>
  );
}
