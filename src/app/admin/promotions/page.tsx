import React from 'react';
import { getActivePromotions } from '@/lib/db';
import { Megaphone } from 'lucide-react';

export const revalidate = 0;

export default async function AdminPromotionsPage() {
  const promotions = await getActivePromotions();

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Promotions & Announcement Banners
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Publish festival offers, seasonal discounts, and top announcement bars.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">
            Active Top Banners ({promotions.length})
          </h2>
        </div>

        {promotions.length > 0 ? (
          <div className="space-y-4">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="p-5 bg-gradient-to-r from-sand-50 to-brand-50/50 rounded-2xl border border-sand-200 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {promo.badge_text && (
                      <span className="bg-brand-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {promo.badge_text}
                      </span>
                    )}
                    <span className="font-bold text-stone-900 text-sm">{promo.title}</span>
                  </div>
                  <p className="text-xs text-stone-600">{promo.banner_text}</p>
                </div>

                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase">
                  Active
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400 space-y-2">
            <Megaphone className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-xs">No active promotional banners configured. You can add them through Supabase promotions table or CMS actions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
