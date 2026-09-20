'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import { Product } from '@/types/database';
import { formatINR, generateWhatsAppLink } from '@/lib/utils';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';

interface ProductCardProps {
  product: Product;
  whatsappPhone?: string;
}

export function ProductCard({ product, whatsappPhone = '9051941774' }: ProductCardProps) {
  const discountPercent =
    product.mrp && product.selling_price && product.mrp > product.selling_price
      ? Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)
      : null;

  const whatsAppMsg = `Hello Desi Fusion Bites, I am interested in purchasing "${product.name}" (${product.weight || product.pack_size || ''}). Please provide pricing and availability.`;
  const whatsAppLink = generateWhatsAppLink(whatsappPhone, whatsAppMsg);

  return (
    <div className="group bg-white rounded-2xl border border-sand-200 hover:border-brand-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Product Image Area */}
      <Link href={`/products/${product.slug}`} className="relative block w-full aspect-square bg-sand-100 overflow-hidden">
        {product.primary_image_url ? (
          <Image
            src={product.primary_image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ImagePlaceholder text="Product image not uploaded" aspectRatio="square" className="h-full rounded-none border-none" />
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_featured && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
          {discountPercent && (
            <span className="inline-block bg-spice-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Availability Badge Overlay */}
        <div className="absolute top-3 right-3 z-10">
          {product.availability === 'in_stock' && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
              In Stock
            </span>
          )}
          {product.availability === 'low_stock' && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-300">
              Low Stock
            </span>
          )}
          {product.availability === 'out_of_stock' && (
            <span className="bg-stone-200 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-stone-300">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category & Attributes */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-stone-500">
            {product.category && (
              <span className="font-semibold text-brand-800 bg-brand-50 px-2 py-0.5 rounded">
                {product.category.name}
              </span>
            )}
            {product.millet_type && (
              <span className="bg-sand-100 px-2 py-0.5 rounded text-stone-600">
                {product.millet_type}
              </span>
            )}
            {product.flavour && (
              <span className="bg-sand-100 px-2 py-0.5 rounded text-stone-600">
                {product.flavour}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block group-hover:text-brand-700 transition-colors">
            <h3 className="font-serif text-lg font-bold text-stone-900 line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-3 border-t border-sand-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl font-bold text-stone-900">
                {product.selling_price ? formatINR(product.selling_price) : 'Price on Request'}
              </span>
              {product.mrp && product.selling_price && product.mrp > product.selling_price && (
                <span className="text-xs text-stone-400 line-through">
                  {formatINR(product.mrp)}
                </span>
              )}
            </div>

            {(product.weight || product.pack_size) && (
              <span className="text-xs font-medium text-stone-500 bg-sand-50 px-2 py-0.5 rounded border border-sand-200">
                {product.weight || product.pack_size}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-sand-100 hover:bg-sand-200 text-stone-800 text-xs font-semibold transition-colors"
            >
              <span>Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Enquire</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
