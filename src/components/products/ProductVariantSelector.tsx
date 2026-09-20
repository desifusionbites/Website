'use client';

import React, { useState } from 'react';
import { MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { Product, ProductVariant } from '@/types/database';
import { formatINR, generateWhatsAppLink } from '@/lib/utils';

interface ProductVariantSelectorProps {
  product: Product;
  whatsappPhone?: string;
}

export function ProductVariantSelector({
  product,
  whatsappPhone = '9051941774',
}: ProductVariantSelectorProps) {
  const variants = product.variants || [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  );

  const currentPrice = selectedVariant?.selling_price ?? product.selling_price;
  const currentMRP = selectedVariant?.mrp ?? product.mrp;
  const currentStock = selectedVariant?.stock_status ?? product.availability;
  const currentWeight = selectedVariant?.pack_size ?? product.weight ?? product.pack_size;

  const discountPercent =
    currentMRP && currentPrice && currentMRP > currentPrice
      ? Math.round(((currentMRP - currentPrice) / currentMRP) * 100)
      : null;

  const variantLabel = selectedVariant ? ` (${selectedVariant.title})` : currentWeight ? ` (${currentWeight})` : '';
  const whatsAppMsg = `Hello Desi Fusion Bites, I would like to order "${product.name}"${variantLabel}. Please share payment and delivery details.`;
  const whatsAppLink = generateWhatsAppLink(whatsappPhone, whatsAppMsg);

  return (
    <div className="space-y-6">
      {/* Pricing Header */}
      <div className="p-5 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900">
            {currentPrice ? formatINR(currentPrice) : 'Price on Request'}
          </span>
          {currentMRP && currentPrice && currentMRP > currentPrice && (
            <span className="text-base sm:text-lg text-stone-400 line-through">
              {formatINR(currentMRP)}
            </span>
          )}
          {discountPercent && (
            <span className="bg-spice-700 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-600">
          <span>Inclusive of all taxes</span>
          <span>•</span>
          {currentStock === 'in_stock' && (
            <span className="text-emerald-700 font-semibold">In Stock (Fresh Batch)</span>
          )}
          {currentStock === 'low_stock' && (
            <span className="text-amber-700 font-semibold">Low Stock</span>
          )}
          {currentStock === 'out_of_stock' && (
            <span className="text-stone-500 font-semibold">Currently Out of Stock</span>
          )}
        </div>
      </div>

      {/* Variant Selector Options if product has variants */}
      {variants.length > 0 && (
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
            Select Pack Size / Option:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    isSelected
                      ? 'border-brand-700 bg-brand-50 text-brand-900 ring-2 ring-brand-300'
                      : 'border-sand-300 bg-white text-stone-700 hover:bg-sand-50'
                  }`}
                >
                  <div>{v.title}</div>
                  {v.selling_price && (
                    <div className="text-[11px] text-stone-500 font-normal">
                      {formatINR(v.selling_price)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary WhatsApp Order CTA */}
      <div className="space-y-3">
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Order on WhatsApp Now</span>
        </a>

        <div className="grid grid-cols-2 gap-3 pt-1 text-xs text-stone-600">
          <div className="flex items-center gap-2 bg-sand-50 p-3 rounded-xl border border-sand-200">
            <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
            <span>FSSAI Certified Batch</span>
          </div>
          <div className="flex items-center gap-2 bg-sand-50 p-3 rounded-xl border border-sand-200">
            <Truck className="w-4 h-4 text-brand-700 shrink-0" />
            <span>Safe Courier Shipping</span>
          </div>
        </div>
      </div>
    </div>
  );
}
