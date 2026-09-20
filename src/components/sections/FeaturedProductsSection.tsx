import React from 'react';
import Link from 'next/link';
import { ArrowRight, PackageOpen } from 'lucide-react';
import { Product } from '@/types/database';
import { ProductCard } from '@/components/products/ProductCard';

interface FeaturedProductsSectionProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  whatsappPhone?: string;
}

export function FeaturedProductsSection({
  products,
  title = 'Our Featured Bites',
  subtitle = 'Handcrafted with traditional recipes and pure ingredients',
  whatsappPhone = '9051941774',
}: FeaturedProductsSectionProps) {
  return (
    <section className="py-16 sm:py-24 bg-white border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-brand-700">
              Desi Fusion Selection
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl">{subtitle}</p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-800 group shrink-0"
          >
            <span>View Complete Catalogue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.slice(0, 8).map((prod) => (
              <ProductCard key={prod.id} product={prod} whatsappPhone={whatsappPhone} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-sand-50 rounded-3xl border border-dashed border-sand-300 max-w-2xl mx-auto space-y-3">
            <PackageOpen className="w-12 h-12 text-sand-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-stone-800">
              New Packaged Products Coming Soon
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              Our catalogue is being updated with fresh batches. You can also contact us directly on WhatsApp for available items.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800 transition-colors"
              >
                <span>Browse Products Page</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
