import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCategories, getProducts, getWebsiteSettings } from '@/lib/db';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductCard } from '@/components/products/ProductCard';
import { PackageOpen, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Packaged Food Catalogue & Snacks',
  description:
    'Browse the complete collection of Desi Fusion Bites packaged snacks, traditional fusion delights, and pure Indian treats.',
};

export const revalidate = 0;

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category;
  const search = resolvedParams.search;
  const sort = resolvedParams.sort || 'default';

  const [categories, allProducts, settings] = await Promise.all([
    getCategories(false),
    getProducts({ search, includeUnpublished: false }),
    getWebsiteSettings(),
  ]);

  // Filter by category if specified
  let filteredProducts = allProducts;
  if (categorySlug && categorySlug !== 'all') {
    filteredProducts = filteredProducts.filter((p) => p.category?.slug === categorySlug);
  }

  // Sorting
  if (sort === 'price_low') {
    filteredProducts.sort((a, b) => (a.selling_price || 0) - (b.selling_price || 0));
  } else if (sort === 'price_high') {
    filteredProducts.sort((a, b) => (b.selling_price || 0) - (a.selling_price || 0));
  } else if (sort === 'name_asc') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  const activeCategoryName = categories.find((c) => c.slug === categorySlug)?.name;

  return (
    <div className="bg-sand-50/50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Desi Fusion Bites Packaged Foods</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
            {activeCategoryName ? `${activeCategoryName}` : 'All Packaged Products'}
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            Handcrafted with authentic spices, quality ingredients, and traditional taste.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <Suspense fallback={<div className="h-16 bg-white rounded-2xl animate-pulse" />}>
          <ProductFilters categories={categories} />
        </Suspense>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                whatsappPhone={settings.whatsapp || '9051941774'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-sand-300 p-8 max-w-xl mx-auto space-y-4">
            <PackageOpen className="w-14 h-14 text-sand-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {search ? 'No products match your search' : 'Catalogue Updating'}
              </h3>
              <p className="text-sm text-stone-600">
                {search
                  ? 'Try searching with a different term or clear the filter.'
                  : 'New batches are being prepared and will be added here by our team shortly.'}
              </p>
            </div>
            <div className="pt-2">
              <a
                href={`https://wa.me/91${(settings.whatsapp || '9051941774').replace(/\D/g, '')}?text=Hello%20Desi%20Fusion%20Bites,%20I%20am%20looking%20for%20available%20products.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow"
              >
                <span>Ask for Today&apos;s Fresh Batch on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
