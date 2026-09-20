import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Sparkles, Truck, Award } from 'lucide-react';
import { WebsiteSettings } from '@/types/database';

interface HeroSectionProps {
  settings: WebsiteSettings;
}

export function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sand-100/90 via-sand-50 to-sand-100/40 py-16 sm:py-24 border-b border-sand-200">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pattern-spice-subtle opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-900 text-xs sm:text-sm font-semibold tracking-wide shadow-xs">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>{settings.hero_badge || 'Purana Swad Naya Tadka'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
              {settings.hero_title || 'Authentic Indian Taste with a Modern Twist'}
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-stone-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {settings.hero_subtitle || 'Discover premium Indian packaged snacks crafted with traditional recipes, authentic spices, and hygienic standards.'}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href={settings.hero_cta_url || '/products'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                <span>{settings.hero_cta_text || 'Explore Products'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/wholesale"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-sand-100 text-stone-800 border border-sand-300 font-semibold text-base shadow-xs hover:shadow transition-all"
              >
                <span>Wholesale Enquiries</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-sand-200/80 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-stone-900">FSSAI Certified</div>
                  <div className="text-[11px] text-stone-500">Lic. 12826999000591</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-brand-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-stone-900">Authentic Taste</div>
                  <div className="text-[11px] text-stone-500">Traditional Tadka</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-spice-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-stone-900">Pan-India Supply</div>
                  <div className="text-[11px] text-stone-500">Retail & Wholesale</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5 flex justify-center">
            {settings.hero_image_url ? (
              <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src={settings.hero_image_url}
                  alt={settings.brand_name || 'Desi Fusion Bites'}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="w-full max-w-md bg-gradient-to-br from-brand-50 via-white to-sand-100 rounded-2xl p-8 border border-sand-300 shadow-xl relative text-center flex flex-col items-center justify-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-spice-600 text-white flex items-center justify-center font-serif text-3xl font-bold shadow-md">
                  DFB
                </div>
                <div className="space-y-2">
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    {settings.brand_name || 'Desi Fusion Bites'}
                  </h2>
                  <p className="text-xs font-semibold text-brand-700 uppercase tracking-widest">
                    {settings.tagline || 'Purana Swad Naya Tadka'}
                  </p>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed max-w-xs">
                  Packaged Food & Traditional Indian Snack Delights by Aruna Harlalka. Ready to delight households and retail shelves across India.
                </p>
                <div className="pt-2">
                  <span className="inline-block px-4 py-1.5 bg-brand-100 text-brand-900 text-xs font-medium rounded-full border border-brand-200">
                    West Bengal • Shipping Nationwide
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
