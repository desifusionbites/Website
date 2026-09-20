import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { WebsiteSettings } from '@/types/database';

interface StorySectionProps {
  settings: WebsiteSettings;
  title?: string;
}

export function StorySection({ settings, title }: StorySectionProps) {
  const paragraphs = settings.story_paragraphs || [
    'Desi Fusion Bites is an Indian packaged food brand managed by proprietor Aruna Harlalka and contact lead Priya Harlalka.',
    'Operating under FSSAI License No. 12826999000591, located at 275 Dwarika Jungle Road, P.O. Bhadrakali, P.S. Uttarpara, Hooghly District, West Bengal - 712232.',
  ];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-sand-50 to-sand-100/60 border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual card */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            {settings.about_image_url ? (
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src={settings.about_image_url}
                  alt="Desi Fusion Bites Story"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-brand-900 to-stone-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-brand-600/20 rounded-full blur-2xl" />
                <div className="relative space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Brand Overview</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
                    &quot;Purana Swad, Naya Tadka&quot;
                  </h3>

                  <p className="text-sm text-stone-300 leading-relaxed">
                    Desi Fusion Bites packaged food products, based in Hooghly District, West Bengal.
                  </p>

                  <div className="pt-4 border-t border-stone-700/80 space-y-2 text-xs text-stone-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>FSSAI License: <strong>{settings.fssai_license || '12826999000591'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Proprietor: <strong>{settings.proprietor || 'Aruna Harlalka'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Hooghly District, West Bengal</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Narrative */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-700">
                About the Brand
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 leading-tight">
                {title || settings.story_title || 'About Desi Fusion Bites'}
              </h2>
            </div>

            <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed">
              {paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800 group"
              >
                <span>Read More About Our Business</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
