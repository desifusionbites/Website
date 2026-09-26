'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cart/CartContext';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-sand-100 flex items-center justify-center text-sand-400 mb-6">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-charcoal mb-2">Your Cart is Empty</h1>
        <p className="text-sand-600 max-w-md text-center mb-8">
          You haven&apos;t added any items to your shopping cart yet. Browse our selection of packaged food products to begin.
        </p>
        <Link href="/products" className="btn-primary flex items-center space-x-2">
          <span>Browse Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb / Back */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center text-sm font-medium text-sand-600 hover:text-saffron transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Continue Shopping
        </Link>
      </div>

      <div className="flex items-center justify-between pb-6 border-b border-sand-200 mb-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Shopping Cart
          </h1>
          <p className="text-sm text-sand-600 mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-sand-200 text-xs font-bold text-sand-500 uppercase tracking-wider">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Unit Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Line Total</div>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-sand-200 shadow-sm flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center"
            >
              {/* Product Info */}
              <div className="col-span-6 flex items-center space-x-4 w-full">
                <div className="w-20 h-20 rounded-xl overflow-hidden relative flex-shrink-0 bg-sand-50 border border-sand-200">
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
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-charcoal text-base truncate">{item.name}</h3>
                  {(item.variantTitle || item.weight) && (
                    <p className="text-xs text-sand-500 font-medium mt-0.5">
                      {item.variantTitle || item.weight}
                    </p>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center space-x-1 mt-2 sm:hidden"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              {/* Unit Price */}
              <div className="col-span-2 text-center text-sm font-semibold text-charcoal hidden sm:block">
                ₹{item.price.toFixed(2)}
              </div>

              {/* Quantity */}
              <div className="col-span-2 flex justify-center w-full sm:w-auto">
                <div className="flex items-center border border-sand-300 rounded-lg bg-sand-50">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-sand-200 text-charcoal transition-colors rounded-l-lg"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-charcoal min-w-[28px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-sand-200 text-charcoal transition-colors rounded-r-lg"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Line Total & Remove */}
              <div className="col-span-2 flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto">
                <div className="text-right">
                  <span className="sm:hidden text-xs text-sand-500 mr-2">Total:</span>
                  <span className="font-bold text-saffron text-base">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-sand-400 hover:text-red-600 transition-colors hidden sm:block"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-sand-50 rounded-2xl border border-sand-200 p-6 space-y-6 sticky top-24">
            <h2 className="font-serif font-bold text-xl text-charcoal">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-sand-700">
                <span>Items Subtotal</span>
                <span className="font-semibold text-charcoal">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sand-700">
                <span>Shipping Charges</span>
                <span className="text-sand-500 italic">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sand-700">
                <span>Estimated Taxes</span>
                <span className="text-sand-500 italic">Inclusive / at checkout</span>
              </div>

              <div className="pt-4 border-t border-sand-200 flex justify-between items-baseline">
                <span className="font-bold text-charcoal text-base">Estimated Total</span>
                <span className="font-serif font-bold text-2xl text-saffron">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/checkout"
                className="btn-primary w-full py-3.5 flex items-center justify-center space-x-2 text-base font-bold shadow-md hover:shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <div className="flex items-center space-x-2 text-xs text-sand-600 justify-center pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>100% Secure Prepaid Payment via Razorpay</span>
              </div>
            </div>

            <div className="bg-white/80 p-3.5 rounded-xl border border-sand-200/80 text-xs text-sand-600 space-y-1">
              <p className="font-semibold text-charcoal">Prepaid Checkout Policy:</p>
              <p>
                We accept UPI (GPay, PhonePe, Paytm), Credit/Debit Cards &amp; NetBanking. Cash on Delivery is currently unavailable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
