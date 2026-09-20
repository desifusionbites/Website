'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Category } from '@/types/database';

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentMillet = searchParams.get('millet') || 'all';
  const currentSort = searchParams.get('sort') || 'default';

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== 'default') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchVal = (formData.get('search') as string)?.trim();
    updateParams('search', searchVal);
  }

  const hasActiveFilters = currentCategory !== 'all' || currentSearch || currentMillet !== 'all';

  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          name="search"
          defaultValue={currentSearch}
          placeholder="Search by product name, flavour, or ingredient..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-sand-50/50"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
      </form>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-sand-100">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => updateParams('category', 'all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
              currentCategory === 'all'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'bg-sand-100 text-stone-700 hover:bg-sand-200'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateParams('category', cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                currentCategory === cat.slug
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-sand-100 text-stone-700 hover:bg-sand-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sorting & Clear */}
        <div className="flex items-center gap-3">
          <select
            value={currentSort}
            onChange={(e) => updateParams('sort', e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-sand-300 bg-white text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="default">Featured / Default</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
