import React from 'react';
import { getPromotions } from '@/lib/db';
import { PromotionManager } from '@/components/admin/PromotionManager';

export const revalidate = 0;

export default async function AdminPromotionsPage() {
  const promotions = await getPromotions();

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

      <PromotionManager initialPromotions={promotions} />
    </div>
  );
}
