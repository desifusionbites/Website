import React from 'react';
import type { Metadata } from 'next';
import { WholesaleForm } from '@/components/forms/WholesaleForm';
import { getWebsiteSettings } from '@/lib/db';
import { Store, TrendingUp, Truck, ShieldCheck, MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Wholesale, Distributor & Reseller Inquiries',
  description:
    'Partner with Desi Fusion Bites. Attractive trade margins, bulk packaging, pan-India supply for distributors, retailers, supermarkets, and snack resellers.',
};

export const revalidate = 0;

export default async function WholesalePage() {
  const settings = await getWebsiteSettings();
  const whatsAppLink = generateWhatsAppLink(
    settings.whatsapp || '9051941774',
    'Hello Desi Fusion Bites, I would like to discuss wholesale/distributor terms for my business.'
  );

  return (
    <div className="bg-sand-50/50 min-h-screen py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-semibold uppercase tracking-wider">
            B2B Commercial Portal
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-stone-900">
            Wholesale & Distributor Supply
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto text-sm sm:text-base">
            Partner with Desi Fusion Bites to stock authentic, packaged Indian snacks. We support kirana stores, supermarket chains, regional stockists, and corporate supply.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs space-y-2">
            <Store className="w-6 h-6 text-brand-700" />
            <h3 className="font-serif font-bold text-stone-900 text-sm">Retail & Kiranas</h3>
            <p className="text-xs text-stone-500">Accessible minimum orders and appealing shelf packaging.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs space-y-2">
            <TrendingUp className="w-6 h-6 text-brand-700" />
            <h3 className="font-serif font-bold text-stone-900 text-sm">Distributor Margins</h3>
            <p className="text-xs text-stone-500">Competitive wholesale pricing structures for high-volume trade.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs space-y-2">
            <Truck className="w-6 h-6 text-brand-700" />
            <h3 className="font-serif font-bold text-stone-900 text-sm">Pan-India Freight</h3>
            <p className="text-xs text-stone-500">Reliable dispatch from Hooghly District, West Bengal to all states.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sand-200 shadow-xs space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
            <h3 className="font-serif font-bold text-stone-900 text-sm">FSSAI Certified</h3>
            <p className="text-xs text-stone-500">100% compliant documentation and standard batch testing.</p>
          </div>
        </div>

        {/* Wholesale Application Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-sand-200 shadow-sm space-y-6">
          <div className="border-b border-sand-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Commercial Inquiry Form
              </h2>
              <p className="text-xs text-stone-500">
                Please complete the business information below. We will review and send our wholesale price catalogue.
              </p>
            </div>
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Direct WhatsApp Desk</span>
            </a>
          </div>

          <WholesaleForm />
        </div>
      </div>
    </div>
  );
}
