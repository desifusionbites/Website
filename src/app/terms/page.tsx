import React from 'react';
import type { Metadata } from 'next';
import { getWebsiteSettings } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and Conditions for Desi Fusion Bites packaged foods.',
};

export default async function TermsPage() {
  const settings = await getWebsiteSettings();

  return (
    <div className="bg-sand-50/50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-sand-200 shadow-xs space-y-6 text-stone-800 text-sm leading-relaxed">
        <h1 className="font-serif text-3xl font-bold text-stone-900 border-b border-sand-200 pb-4">
          Terms & Conditions
        </h1>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or ordering from {settings.brand_name || 'Desi Fusion Bites'}, you agree to adhere to these terms and conditions. All packaged products are subject to availability and batch processing schedules.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">2. Pricing & Orders</h2>
          <p>
            All prices are listed in Indian Rupees (INR). We reserve the right to revise product specifications and pricing without prior notice. Wholesale orders are subject to written confirmation and agreed Minimum Order Quantities (MOQ).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">3. Food Safety & FSSAI Compliance</h2>
          <p>
            All products are manufactured and packed in compliance with FSSAI regulations under License No. <strong>{settings.fssai_license || '12826999000591'}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
