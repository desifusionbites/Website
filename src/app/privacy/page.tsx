import React from 'react';
import type { Metadata } from 'next';
import { getWebsiteSettings } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Desi Fusion Bites.',
};

export default async function PrivacyPage() {
  const settings = await getWebsiteSettings();

  return (
    <div className="bg-sand-50/50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-sand-200 shadow-xs space-y-6 text-stone-800 text-sm leading-relaxed">
        <h1 className="font-serif text-3xl font-bold text-stone-900 border-b border-sand-200 pb-4">
          Privacy Policy
        </h1>
        <p className="text-xs text-stone-500">Last updated: September 2026</p>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">1. Information We Collect</h2>
          <p>
            At {settings.brand_name || 'Desi Fusion Bites'}, we collect information you provide directly to us when submitting customer enquiries, placing retail or wholesale orders, or communicating via WhatsApp or email. This may include your name, contact phone number, email address, shipping address, and business name.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">2. How We Use Your Information</h2>
          <p>
            We use your data strictly to process your orders, provide customer support, deliver products via third-party logistics partners, and communicate updates about your orders or wholesale applications.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">3. Information Sharing & Security</h2>
          <p>
            We do not sell, rent, or trade your personal data. Your contact and shipping details are only shared with authorized courier/freight partners strictly for delivering your orders.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">4. Contact Information</h2>
          <p>
            For any privacy-related queries, reach us at:
            <br />
            <strong>Email:</strong> {settings.email || 'desifusionbites@gmail.com'}
            <br />
            <strong>Address:</strong> {settings.address_line1}, {settings.address_line2}, {settings.district}, {settings.state} - {settings.pincode}, India.
          </p>
        </section>
      </div>
    </div>
  );
}
