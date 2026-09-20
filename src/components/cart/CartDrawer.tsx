'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart/CartContext';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, itemCount } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-sand-200 flex items-center justify-between bg-cream">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-saffron" />
              <h2 className="font-serif font-bold text-lg text-charcoal">
                Your Cart ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-sand-500 hover:text-charcoal hover:bg-sand-200 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center text-sand-400">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <p className="font-medium text-charcoal text-base">Your cart is currently empty</p>
                  <p className="text-sm text-sand-600 mt-1">
                    Discover our authentic packaged snacks & bites.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary text-sm py-2.5 px-6"
                >
                  Explore Products
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 p-3 bg-sand-50 rounded-xl border border-sand-200"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative bg-white border border-sand-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <ImagePlaceholder text="No Image" className="w-full h-full rounded-none border-none p-1" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-charcoal truncate">{item.name}</h3>
                      {item.variantTitle && (
                        <p className="text-xs text-sand-600 truncate mt-0.5">
                          Variant: {item.variantTitle}
                        </p>
                      )}
                      {item.weight && (
                        <p className="text-xs text-sand-500 mt-0.5">{item.weight}</p>
                      )}
                      <p className="text-sm font-bold text-saffron mt-1">
                        ₹{item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-sand-200/60">
                      <div className="flex items-center border border-sand-300 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-sand-100 text-charcoal transition-colors rounded-l-lg"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-sand-100 text-charcoal transition-colors rounded-r-lg"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-sand-400 hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-sand-200 bg-sand-50 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-sand-700">
                  <span>Subtotal</span>
                  <span className="font-bold text-charcoal">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-sand-500">
                  <span>Shipping & Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full py-3 flex items-center justify-center space-x-2 text-center text-sm font-bold shadow-md hover:shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-xs font-semibold text-sand-700 hover:text-saffron py-1.5 transition-colors"
                >
                  View Full Cart Page
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
