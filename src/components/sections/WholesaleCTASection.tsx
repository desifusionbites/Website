import React from 'react';
import Link from 'next/link';
import { Store, TrendingUp, Truck, ArrowRight, MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/utils';

interface WholesaleCTASectionProps {
  phone?: string;
  title?: string;
  subtitle?: string;
}

export function WholesaleCTASection({
  phone = '9051941774',
  title = 'Distributor & Wholesale Opportunities',
  subtitle = 'Expand your retail shelves or distribution network with Desi Fusion Bites packaged foods.',
}: WholesaleCTASectionProps) {
  const whatsAppLink = generateWhatsAppLink(
    phone,
    'Hello Desi Fusion Bites, I am interested in wholesale/distributor supply. Please share MOQ and catalog.'
  );

  return (
    <section className="py-16 sm:py-20 bg-stone-900 text-white relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="bg-gradient-to-r from-stone-800 to-stone-800/80 border border-stone-700 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold uppercase tracking-wider">
                B2B & Trade Partners
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                {title}
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                {subtitle} We offer attractive trade margins, hygienic packaging, consistent batch quality, and dedicated support for distributors and retailers across India.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-brand-400 shrink-0" />
                  <span className="text-xs font-medium text-stone-200">Retailers & Kiranas</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-brand-400 shrink-0" />
                  <span className="text-xs font-medium text-stone-200">Regional Distributors</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-brand-400 shrink-0" />
                  <span className="text-xs font-medium text-stone-200">Bulk & Event Supply</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/wholesale"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-colors"
                >
                  <span>Submit Wholesale Form</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Wholesale WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 bg-stone-900/90 rounded-2xl p-6 sm:p-8 border border-stone-700 space-y-4">
              <h3 className="font-serif text-lg font-bold text-white border-b border-stone-800 pb-3">
                Why Partner with Desi Fusion Bites?
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-stone-300">
                <li className="flex items-start gap-2">
                  <span className="text-brand-400 font-bold">•</span>
                  <span><strong>FSSAI Compliant:</strong> Fully licensed and hygienically packed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-400 font-bold">•</span>
                  <span><strong>Competitive MOQ:</strong> Accessible minimum orders for emerging retailers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-400 font-bold">•</span>
                  <span><strong>Fresh Batch Production:</strong> No stale inventory, processed with care.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-400 font-bold">•</span>
                  <span><strong>Reliable Shipping:</strong> Safe courier & freight dispatch across India.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
