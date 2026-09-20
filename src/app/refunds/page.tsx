import React from 'react';
import type { Metadata } from 'next';
import { getWebsiteSettings } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy',
  description: 'Cancellation and Refund Policy for Desi Fusion Bites.',
};

export default async function RefundsPage() {
  const settings = await getWebsiteSettings();

  return (
    <div className="bg-sand-50/50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-sand-200 shadow-xs space-y-6 text-stone-800 text-sm leading-relaxed">
        <h1 className="font-serif text-3xl font-bold text-stone-900 border-b border-sand-200 pb-4">
          Cancellation & Refund Policy
        </h1>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">1. Cancellations</h2>
          <p>
            Orders can be cancelled before they are dispatched by reaching out to our WhatsApp support at <strong>+91 {settings.phone || '9051941774'}</strong>. Once an order is handed over to the courier partner, cancellations cannot be processed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">2. Damaged or Incorrect Items</h2>
          <p>
            Because our products are packaged food items, returns are only accepted in cases of transit damage, seal tampering, or incorrect product shipment. Please notify us within 24 hours of receiving your parcel along with unboxing photographs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">3. Refund Processing</h2>
          <p>
            Approved refunds will be processed to the original payment method or bank account within 5 to 7 business days.
          </p>
        </section>
      </div>
    </div>
  );
}
