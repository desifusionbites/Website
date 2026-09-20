import React from 'react';
import { Star } from 'lucide-react';
import { Testimonial } from '@/types/database';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
}

export function TestimonialsSection({
  testimonials,
  title = 'Customer Reviews',
  subtitle = 'Genuine feedback from patrons who have savoured Desi Fusion Bites',
}: TestimonialsSectionProps) {
  // If no real testimonials are entered by owner yet, render a subtle note or hide gracefully
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-sand-50/70 border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-700">
            Real Experiences
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">{title}</h2>
          <p className="text-sm sm:text-base text-stone-600">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-700 text-sm italic leading-relaxed">
                  &quot;{t.review_text}&quot;
                </p>
              </div>

              <div className="pt-3 border-t border-sand-100 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-stone-900 block font-semibold">{t.customer_name}</strong>
                  {t.location && <span className="text-stone-500">{t.location}</span>}
                </div>
                {t.product_reference && (
                  <span className="text-[11px] bg-sand-100 text-stone-600 px-2 py-0.5 rounded font-medium">
                    {t.product_reference}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
