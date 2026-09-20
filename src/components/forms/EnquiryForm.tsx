'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { submitEnquiryAction } from '@/lib/actions';
import { EnquiryType } from '@/types/database';

interface EnquiryFormProps {
  defaultType?: EnquiryType;
  productName?: string;
  className?: string;
}

export function EnquiryForm({
  defaultType = 'general',
  productName,
  className,
}: EnquiryFormProps) {
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
      setSuccessMsg(res.message || 'Thank you! Your enquiry has been received.');
      (e.target as HTMLFormElement).reset();
    } else {
      setErrorMsg(res.error || 'Failed to submit enquiry. Please try WhatsApp directly.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className || ''}`}>
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

      <input type="hidden" name="type" value={defaultType} />
      {productName && <input type="hidden" name="product_interest" value={productName} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Your name"
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            required
            placeholder="10-digit mobile number"
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com (optional)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            City / Location
          </label>
          <input
            type="text"
            name="city"
            placeholder="City, State"
            className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1">
          Message / Requirement <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={3}
          defaultValue={productName ? `Hi, I am interested in ${productName}. Please share pricing and shipping details.` : ''}
          placeholder="Tell us about what you are looking for..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-stone-900 text-sm resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white font-semibold text-sm shadow-md transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Enquiry</span>
          </>
        )}
      </button>
    </form>
  );
}
