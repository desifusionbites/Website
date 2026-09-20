import React from 'react';
import { getFAQs } from '@/lib/db';
import { HelpCircle } from 'lucide-react';

export const revalidate = 0;

export default async function AdminFAQsPage() {
  const faqs = await getFAQs(true);

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          FAQ Management
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage frequently asked questions that appear on the customer help page.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
          Published & Draft FAQs ({faqs.length})
        </h2>

        {faqs.length > 0 ? (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-4 rounded-xl border border-stone-200 bg-sand-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-stone-900">{faq.question}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${faq.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                    {faq.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400 space-y-2">
            <HelpCircle className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-xs">No FAQs entered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
