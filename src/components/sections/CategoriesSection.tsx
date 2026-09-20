import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Layers } from 'lucide-react';
import { Category } from '@/types/database';

interface CategoriesSectionProps {
  categories: Category[];
  title?: string;
  subtitle?: string;
}

export function CategoriesSection({
  categories,
  title = 'Explore by Category',
  subtitle = 'Browse our range of authentic Indian packaged food products',
}: CategoriesSectionProps) {
  // Graceful empty state if owner has not added categories yet
  if (!categories || categories.length === 0) {
    return (
      <section className="py-16 bg-sand-50/60 border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">{title}</h2>
          <p className="mt-2 text-sm text-stone-600 max-w-xl mx-auto">{subtitle}</p>
          <div className="mt-8 p-8 border border-dashed border-sand-300 rounded-2xl bg-white max-w-md mx-auto text-stone-500">
            <Layers className="w-8 h-8 mx-auto text-sand-400 mb-2" />
            <p className="text-xs">Categories will be displayed here once published by the owner in Admin.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-sand-50/80 border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-stone-600">{subtitle}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative bg-white rounded-2xl p-6 border border-sand-200 hover:border-brand-400 shadow-xs hover:shadow-lg transition-all text-center flex flex-col items-center"
            >
              {cat.image_url ? (
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-4 bg-sand-100 p-1">
                  <Image src={cat.image_url} alt={cat.name} fill className="object-cover rounded-full" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="w-7 h-7" />
                </div>
              )}

              <h3 className="font-serif font-bold text-stone-900 group-hover:text-brand-700 transition-colors text-base sm:text-lg">
                {cat.name}
              </h3>

              {cat.description && (
                <p className="mt-1 text-xs text-stone-500 line-clamp-2">{cat.description}</p>
              )}

              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 group-hover:translate-x-0.5 transition-transform">
                <span>View Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
