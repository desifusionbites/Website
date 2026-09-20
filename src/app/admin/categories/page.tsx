import React from 'react';
import { getCategories } from '@/lib/db';
import { CategoryManager } from '@/components/admin/CategoryManager';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await getCategories(true);

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Category Management
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Create and organize product categories. Categories appear on the homepage and catalogue filters.
        </p>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
