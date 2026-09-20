import React from 'react';
import { Package, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  text?: string;
  className?: string;
  icon?: 'package' | 'image';
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
}

export function ImagePlaceholder({
  text = 'Image not uploaded yet',
  className,
  icon = 'package',
  aspectRatio = 'square',
}: ImagePlaceholderProps) {
  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'banner'
      ? 'aspect-[21/9]'
      : '';

  return (
    <div
      className={cn(
        'w-full flex flex-col items-center justify-center bg-sand-100/70 border border-dashed border-sand-300 rounded-xl p-6 text-sand-700 transition-colors',
        aspectClass,
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-sand-200/80 flex items-center justify-center mb-2.5 text-sand-600 shadow-inner">
        {icon === 'package' ? (
          <Package className="w-6 h-6 stroke-[1.5]" />
        ) : (
          <ImageIcon className="w-6 h-6 stroke-[1.5]" />
        )}
      </div>
      <p className="text-xs font-medium text-sand-600 tracking-wide uppercase text-center max-w-[200px]">
        {text}
      </p>
    </div>
  );
}
