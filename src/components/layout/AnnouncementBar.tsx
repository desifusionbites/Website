import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Promotion } from '@/types/database';

interface AnnouncementBarProps {
  promotions: Promotion[];
}

export function AnnouncementBar({ promotions }: AnnouncementBarProps) {
  if (!promotions || promotions.length === 0) return null;

  const activePromo = promotions[0];

  return (
    <aside aria-label="Announcement" className="bg-gradient-to-r from-brand-700 via-spice-700 to-brand-800 text-white text-xs sm:text-sm py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center flex-wrap">
        {activePromo.badge_text && (
          <span className="bg-white/20 backdrop-blur-xs text-white font-semibold text-[10px] sm:text-xs px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            {activePromo.badge_text}
          </span>
        )}
        <span className="font-medium tracking-wide">
          {activePromo.banner_text || activePromo.title}
        </span>
        {activePromo.cta_url && activePromo.cta_label && (
          <Link
            href={activePromo.cta_url}
            className="underline underline-offset-2 hover:text-amber-200 inline-flex items-center gap-1 font-semibold ml-1"
          >
            <span>{activePromo.cta_label}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </aside>
  );
}
