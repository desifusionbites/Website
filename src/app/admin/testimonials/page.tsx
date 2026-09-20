import React from 'react';
import { getTestimonials } from '@/lib/db';
import { Star, MessageSquareQuote } from 'lucide-react';

export const revalidate = 0;

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials(true);

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Customer Testimonials Management
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Publish real reviews and feedback received from patrons across India.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
          Verified Reviews ({testimonials.length})
        </h2>

        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <div key={t.id} className="p-4 bg-sand-50 rounded-2xl border border-sand-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">{t.customer_name}</span>
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-700 italic">&quot;{t.review_text}&quot;</p>
                <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1">
                  <span>{t.location || 'India'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                    {t.is_published ? 'Published' : 'Hidden'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400 space-y-2">
            <MessageSquareQuote className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-xs">No customer reviews entered yet. Genuine reviews entered here will appear on the homepage.</p>
          </div>
        )}
      </div>
    </div>
  );
}
