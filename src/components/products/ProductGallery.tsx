'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';

interface ProductGalleryProps {
  primaryImage: string | null;
  galleryImages?: string[] | null;
  productName: string;
}

export function ProductGallery({
  primaryImage,
  galleryImages = [],
  productName,
}: ProductGalleryProps) {
  const allImages = [
    ...(primaryImage ? [primaryImage] : []),
    ...(Array.isArray(galleryImages) ? galleryImages : []),
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="w-full aspect-square rounded-3xl overflow-hidden border border-sand-200">
        <ImagePlaceholder text="Product image not uploaded" aspectRatio="square" className="h-full rounded-none" />
      </div>
    );
  }

  const activeImage = allImages[selectedIndex] || allImages[0];

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-white border border-sand-200 shadow-sm">
        <Image
          src={activeImage}
          alt={`${productName} view ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-cover"
        />
      </div>

      {/* Gallery Thumbnail Strip */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                selectedIndex === idx
                  ? 'border-brand-600 ring-2 ring-brand-300'
                  : 'border-sand-200 opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
