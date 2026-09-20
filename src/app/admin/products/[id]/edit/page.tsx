import React from 'react';
import { notFound } from 'next/navigation';
import { getProducts, getCategories } from '@/lib/db';
import { ProductForm } from '@/components/admin/ProductForm';

export const revalidate = 0;

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [products, categories] = await Promise.all([
    getProducts({ includeUnpublished: true }),
    getCategories(true),
  ]);

  const product = products.find((p) => p.id === id);
  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Edit Product: {product.name}
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Update prices, variants, descriptions, photos, and availability.
        </p>
      </div>

      <ProductForm categories={categories} initialProduct={product} />
    </div>
  );
}
