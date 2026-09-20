'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/utils';

interface FloatingWhatsAppProps {
  phone: string;
  brandName?: string;
}

export function FloatingWhatsApp({ phone, brandName = 'Desi Fusion Bites' }: FloatingWhatsAppProps) {
  const url = generateWhatsAppLink(
    phone,
    `Hello ${brandName}, I am interested in your products. Please share your product catalogue and details.`
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center group">
      <span className="hidden sm:block mr-2.5 px-3 py-1.5 bg-stone-900/90 backdrop-blur-xs text-white text-xs font-medium rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Order or Inquire on WhatsApp
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
}
