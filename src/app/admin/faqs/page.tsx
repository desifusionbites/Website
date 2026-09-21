import React from 'react';
import { getFAQs } from '@/lib/db';
import { FAQManager } from '@/components/admin/FAQManager';

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
          Create, edit, reorder, and publish frequently asked questions for customers.
        </p>
      </div>

      <FAQManager initialFAQs={faqs} />
    </div>
  );
}
