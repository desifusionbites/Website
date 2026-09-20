'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { submitEnquiryAction } from '@/lib/actions';

export function WholesaleForm() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await submitEnquiryAction(formData);

    setLoading(false);
    if (res.success) {
      setSuccessMsg(
        res.message || 'Thank you! Your wholesale enquiry has been submitted. Our commercial team will contact you shortly.'
      );
      (e.target as HTMLFormElement).reset();
    } else {
      setErrorMsg(res.error || 'Failed to submit enquiry. Please try reaching us directly on WhatsApp.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>{successMsg}</div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Business / Store Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="business_name"
            required
            placeholder="e.g. Royal Mart or Harlalka Traders"
            className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Contact Person Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            required
            placeholder="10-digit mobile number"
            className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            WhatsApp Number
          </label>
          <input
            type="tel"
            name="whatsapp"
            placeholder="WhatsApp number"
            className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="business@example.com"
            className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Business Type <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            required
            defaultValue="wholesale"
            className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          >
            <option value="wholesale">Wholesaler</option>
            <option value="distributor">Distributor / Stockist</option>
            <option value="retailer">Retailer / Supermarket</option>
            <option value="general">Institutional / Canteen / Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            required
            placeholder="e.g. Kolkata, Howrah, Hooghly"
            className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="state"
            required
            placeholder="e.g. West Bengal"
            className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Products Interested In
          </label>
          <input
            type="text"
            name="product_interest"
            placeholder="e.g. All Packaged Snacks, Millet items, Specific Flavours"
            className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Estimated Monthly Order Volume
          </label>
          <input
            type="text"
            name="estimated_quantity"
            placeholder="e.g. 100-500 packs, 50-100 kgs, bulk cartons"
            className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">
          Additional Notes / Requirements <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Please share details about your distribution area, retail store footprint, or specific requirements..."
          className="w-full px-4 py-3 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 py-4 px-8 rounded-xl bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white font-bold text-base shadow-lg transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Submitting Wholesale Application...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Submit Wholesale & Trade Enquiry</span>
          </>
        )}
      </button>
    </form>
  );
}
