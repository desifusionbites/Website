'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  ShoppingBag,
  ArrowLeft,
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/lib/cart/CartContext';
import { createCheckoutSessionAction, verifyPaymentAction } from '@/lib/actions/checkout';
import { createClient } from '@/lib/supabase/client';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { User, LogIn, UserPlus } from 'lucide-react';

// Indian States and Union Territories
const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [user, setUser] = useState<{ id: string; email?: string; name?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddressLine1: '',
    shippingAddressLine2: '',
    shippingCity: '',
    shippingState: 'West Bengal',
    shippingPincode: '',
    customerNotes: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadAuthUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || '';
          setUser({ id: user.id, email: user.email, name });
          setFormData((prev) => ({
            ...prev,
            customerEmail: user.email || prev.customerEmail,
            customerName: prev.customerName || name,
          }));
        }
      } catch {
        // Continue
      } finally {
        setAuthLoading(false);
      }
    }
    loadAuthUser();
  }, []);

  const shippingAmount = subtotal >= 499 ? 0.0 : 60.0;
  const totalAmount = subtotal + shippingAmount;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center text-sand-400 mb-4">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-charcoal mb-2">Your Cart is Empty</h1>
        <p className="text-sand-600 text-sm mb-6 text-center max-w-sm">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link href="/products" className="btn-primary text-sm py-2.5 px-6">
          Browse Products
        </Link>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setErrorMessage('Please sign in or create an account to proceed to payment.');
      router.push('/login?redirect=/checkout&error=auth_required');
      return;
    }

    // Basic client-side validation
    if (!/^[6-9]\d{9}$/.test(formData.customerPhone.trim())) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g. 9051941774).');
      return;
    }

    if (!/^\d{6}$/.test(formData.shippingPincode.trim())) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create internal pending order & Razorpay order via Server Action
      const sessionRes = await createCheckoutSessionAction({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        shippingAddressLine1: formData.shippingAddressLine1,
        shippingAddressLine2: formData.shippingAddressLine2 || undefined,
        shippingCity: formData.shippingCity,
        shippingState: formData.shippingState,
        shippingPincode: formData.shippingPincode,
        shippingCountry: 'India',
        customerNotes: formData.customerNotes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });

      if (!sessionRes.success || !sessionRes.orderId || !sessionRes.razorpayOrderId) {
        setErrorMessage(sessionRes.error || 'Failed to initialize checkout. Please try again.');
        setIsProcessing(false);
        return;
      }

      const { orderId, orderNumber, razorpayOrderId, amountPaise, keyId } = sessionRes;

      // In local development mode without configured Razorpay credentials, simulate instant payment verification
      if (!keyId || keyId.includes('mock') || !window.Razorpay) {
        const verifyRes = await verifyPaymentAction({
          orderId,
          razorpayOrderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'mock_signature_dev',
        });

        if (verifyRes.success) {
          clearCart();
          router.push(`/order-confirmation/${orderNumber}`);
        } else {
          setErrorMessage(verifyRes.error || 'Payment verification failed');
          setIsProcessing(false);
        }
        return;
      }

      // 2. Open standard Razorpay Checkout Modal
      const options: RazorpayOptions = {
        key: keyId,
        amount: amountPaise || Math.round(totalAmount * 100),
        currency: 'INR',
        name: 'Desi Fusion Bites',
        description: `Order ${orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone,
        },
        theme: {
          color: '#e05a1b', // Warm saffron brand color
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // 3. Server-side payment verification
            const verifyRes = await verifyPaymentAction({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              clearCart();
              router.push(`/order-confirmation/${orderNumber}`);
            } else {
              setErrorMessage(verifyRes.error || 'Payment verification failed on server');
              setIsProcessing(false);
            }
          } catch {
            setErrorMessage('Network error during payment verification');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred during checkout');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center text-sm font-medium text-sand-600 hover:text-saffron transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Cart
          </Link>
        </div>

        <div className="pb-6 border-b border-sand-200 mb-8 flex items-baseline justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              Secure Checkout
            </h1>
            <p className="text-sm text-sand-600 mt-1">
              Direct delivery across India with 100% verified online payment.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit SSL Encrypted Payment</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Checkout Notice</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {!authLoading && !user && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-sand-100 via-brand-50 to-sand-100 border border-brand-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-serif font-bold text-stone-900 text-base">
                <User className="w-5 h-5 text-brand-700" />
                <span>Account Required to Place Order</span>
              </div>
              <p className="text-xs text-stone-600 max-w-md leading-relaxed">
                Sign in or create a quick account to checkout, receive live tracking SMS/emails, and access invoices.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/login?redirect=/checkout"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup?redirect=/checkout"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-sand-50 text-stone-800 border border-sand-300 text-xs font-bold shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </Link>
            </div>
          </div>
        )}

        {!authLoading && user && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ordering as: <strong>{user.email}</strong> {user.name ? `(${user.name})` : ''}</span>
            </div>
            <Link href="/account" className="text-emerald-700 hover:underline font-bold text-[11px]">
              My Account →
            </Link>
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Customer & Delivery Details */}
            <div className="lg:col-span-7 space-y-8">
              {/* Contact Information */}
              <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-xs space-y-4">
                <h2 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
                  <span>1. Contact Details</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="e.g. Priya Harlalka"
                      className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:ring-2 focus:ring-saffron/40 focus:border-saffron text-sm bg-sand-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Mobile Number (10 Digits) *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-sand-300 bg-sand-100 text-sand-700 text-sm font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="customerPhone"
                        required
                        maxLength={10}
                        value={formData.customerPhone}
                        onChange={handleChange}
                        placeholder="9051941774"
                        className="w-full px-4 py-2.5 rounded-r-xl border border-sand-300 focus:ring-2 focus:ring-saffron/40 focus:border-saffron text-sm bg-sand-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      required
                      value={formData.customerEmail}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:ring-2 focus:ring-saffron/40 focus:border-saffron text-sm bg-sand-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white p-6 rounded-2xl border border-sand-200 shadow-xs space-y-4">
                <h2 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
                  <span>2. Delivery Address</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Street Address / House No. / Building *
                    </label>
                    <input
                      type="text"
                      name="shippingAddressLine1"
                      required
                      value={formData.shippingAddressLine1}
                      onChange={handleChange}
                      placeholder="e.g. 275 Dwarika Jungle Road"
                      className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:ring-2 focus:ring-saffron/40 focus:border-saffron text-sm bg-sand-50/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Apartment, Floor, Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="shippingAddressLine2"
                      value={formData.shippingAddressLine2}
                      onChange={handleChange}
                      placeholder="e.g. P.O. Bhadrakali, Near Uttarpara"
                      className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:ring-2 focus:ring-saffron/40 focus:border-saffron text-sm bg-sand-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      City / District *
                    </label>
                    <input
                      type="text"
                      name="shippingCity"
                      required
                      value={formData.shippingCity}
                      onChange={handleChange}
                      placeholder="e.g. Hooghly / Kolkata"
                      className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:ring-2 focus:ring-saffron/40 focus:border-saffron text-sm bg-sand-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      State *
                    </label>
                    <select
                      name="shippingState"
                      required
                      value={formData.shippingState}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:ring-2 focus:ring-saffron/40 focus:border-saffron text-sm bg-sand-50/50"
                    >
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      PIN Code (6 Digits) *
                    </label>
                    <input
                      type="text"
                      name="shippingPincode"
                      required
                      maxLength={6}
                      value={formData.shippingPincode}
                      onChange={handleChange}
                      placeholder="712232"
                      className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:ring-2 focus:ring-saffron/40 focus:border-saffron text-sm bg-sand-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="India"
                      className="w-full px-4 py-2.5 rounded-xl border border-sand-300 bg-sand-100 text-sand-700 text-sm font-semibold cursor-not-allowed"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Special Delivery Instructions (Optional)
                    </label>
                    <textarea
                      name="customerNotes"
                      rows={2}
                      value={formData.customerNotes}
                      onChange={handleChange}
                      placeholder="e.g. Leave at security desk, call before delivery"
                      className="w-full px-4 py-2 rounded-xl border border-sand-300 focus:ring-2 focus:ring-saffron/40 focus:border-saffron text-sm bg-sand-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Notice */}
              <div className="bg-sand-50 p-5 rounded-2xl border border-sand-200 space-y-2">
                <div className="flex items-center space-x-2 text-charcoal font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-saffron" />
                  <span>Payment Gateway: Razorpay (Prepaid Online)</span>
                </div>
                <p className="text-xs text-sand-600 leading-relaxed">
                  UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, NetBanking, and Wallets are supported. Cash on Delivery (COD) is currently not supported.
                </p>
              </div>
            </div>

            {/* Right: Order Items & Pricing Breakdown */}
            <div className="lg:col-span-5">
              <div className="bg-sand-50 rounded-2xl border border-sand-200 p-6 space-y-6 sticky top-24">
                <h2 className="font-serif font-bold text-xl text-charcoal">Your Order Items</h2>

                {/* Items preview list */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex space-x-3 p-2.5 bg-white rounded-xl border border-sand-200/80 items-center"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden relative flex-shrink-0 bg-sand-50 border border-sand-200">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <ImagePlaceholder text="DFB" className="w-full h-full rounded-none border-none p-0.5 text-[8px]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-charcoal text-xs truncate">{item.name}</p>
                        {item.variantTitle && (
                          <p className="text-[11px] text-sand-600 truncate">{item.variantTitle}</p>
                        )}
                        <p className="text-xs text-sand-500 mt-0.5">
                          Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right font-bold text-charcoal text-xs">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price calculations */}
                <div className="space-y-2.5 pt-4 border-t border-sand-200 text-sm">
                  <div className="flex justify-between text-sand-700">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-charcoal">₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sand-700">
                    <span className="flex items-center space-x-1.5">
                      <Truck className="w-4 h-4 text-sand-500" />
                      <span>Delivery Fee</span>
                    </span>
                    <span className="font-semibold text-charcoal">
                      {shippingAmount === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE</span>
                      ) : (
                        `₹${shippingAmount.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {shippingAmount > 0 && (
                    <p className="text-[11px] text-saffron">
                      Add ₹{(499 - subtotal).toFixed(2)} more for FREE Delivery!
                    </p>
                  )}

                  <div className="pt-3 border-t border-sand-200 flex justify-between items-baseline">
                    <span className="font-bold text-charcoal text-base">Total Payable</span>
                    <span className="font-serif font-bold text-2xl text-saffron">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary w-full py-4 flex items-center justify-center space-x-2 text-base font-bold shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting to Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{totalAmount.toFixed(2)} via Razorpay</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center space-x-2 text-xs text-sand-600 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cards, UPI, NetBanking • Razorpay Secure</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
