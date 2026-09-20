import React from 'react';
import type { Metadata } from 'next';
import { getFAQs } from '@/lib/db';
import { HelpCircle, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ)',
  description:
    'Common questions about Desi Fusion Bites packaged foods, ingredients, shelf life, delivery, and wholesale orders.',
};

export const revalidate = 0;

export default async function FAQPage() {
  const faqs = await getFAQs(false);

  return (
    <div className="bg-sand-50/50 min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Help Center</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-stone-900">
            Frequently Asked Questions
          </h1>
          <p className="text-stone-600 text-sm sm:text-base">
            Find answers to common queries about our authentic packaged snacks and shipping.
          </p>
        </div>

        {faqs.length > 0 ? (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group bg-white rounded-2xl border border-sand-200 p-5 sm:p-6 shadow-xs [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer font-serif font-bold text-stone-900 text-base sm:text-lg">
                  <span>{faq.question}</span>
                  <span className="ml-4 shrink-0 transition-transform duration-200 group-open:rotate-180 text-brand-700">
                    ▼
                  </span>
                </summary>
                <div className="mt-4 pt-4 border-t border-sand-100 text-stone-700 text-sm sm:text-base leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-sand-200 space-y-3 max-w-lg mx-auto">
            <HelpCircle className="w-12 h-12 text-sand-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-stone-900">Have a Question?</h3>
            <p className="text-xs text-stone-600">
              Our FAQs are being updated. Feel free to contact our customer desk on WhatsApp directly for any inquiry.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/919051941774?text=Hello%20Desi%20Fusion%20Bites,%20I%20have%20a%20question."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs shadow"
              >
                <span>Ask on WhatsApp (9051941774)</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
