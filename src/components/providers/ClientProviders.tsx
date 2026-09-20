'use client';

import React from 'react';
import { CartProvider } from '@/lib/cart/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
