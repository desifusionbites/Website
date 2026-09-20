import React from 'react';
import { getCategories } from '@/lib/db';
import { ProductForm } from '@/components/admin/ProductForm';

export const revalidate = 0;

export default async function NewProductPage() {
  const categories = await getCategories(true);

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Create New Product
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Add a new packaged food product, set pricing, upload packaging photos, and publish.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
