'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart/CartContext';

export function CartIcon() {
  const { itemCount, setIsOpen } = useCart();

  return (
    <button
      onClick={() => setIsOpen(true)}
      aria-label="View Shopping Cart"
      className="relative p-2 text-charcoal hover:text-saffron transition-colors rounded-full hover:bg-cream"
    >
      <ShoppingBag className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-saffron text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
