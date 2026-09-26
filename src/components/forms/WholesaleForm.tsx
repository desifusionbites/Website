'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, MessageCircle, ExternalLink } from 'lucide-react';
import { submitEnquiryAction } from '@/lib/actions';
import { generateWhatsAppLink } from '@/lib/utils';

export function WholesaleForm({ ownerPhone = '9051941774' }: { ownerPhone?: string }) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ownerNotifyLink, setOwnerNotifyLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setOwnerNotifyLink(null);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const businessName = (formData.get('business_name') as string)?.trim() || '';
    const contactName = (formData.get('name') as string)?.trim() || '';
    const phone = (formData.get('phone') as string)?.trim() || '';
    const whatsapp = (formData.get('whatsapp') as string)?.trim() || phone;
    const email = (formData.get('email') as string)?.trim() || '';
    const type = (formData.get('type') as string)?.trim() || 'Wholesale';
    const city = (formData.get('city') as string)?.trim() || '';
    const state = (formData.get('state') as string)?.trim() || '';
    const productInterest = (formData.get('product_interest') as string)?.trim() || 'All packaged snacks';
    const estimatedQuantity = (formData.get('estimated_quantity') as string)?.trim() || 'Commercial Volume';
    const message = (formData.get('message') as string)?.trim() || '';

    const res = await submitEnquiryAction(formData);

    setLoading(false);
    if (res.success) {
      // Build instant WhatsApp notification for owner
      const notifyMessage = `🔔 *NEW WHOLESALE ORDER / ENQUIRY - DESI FUSION BITES*\n----------------------------------------\n🏢 *Business Name*: ${businessName}\n👤 *Contact Person*: ${contactName}\n📞 *Phone*: ${phone}\n💬 *WhatsApp*: ${whatsapp}\n${email ? `📧 *Email*: ${email}\n` : ''}🏛️ *Type*: ${type}\n📍 *Location*: ${city}, ${state}\n📦 *Product Interest*: ${productInterest}\n📊 *Est. Volume*: ${estimatedQuantity}\n📝 *Requirement / Notes*:\n${message}\n----------------------------------------\n*Submitted via Website Wholesale Portal*`;

      const notifyUrl = generateWhatsAppLink(ownerPhone, notifyMessage);
      setOwnerNotifyLink(notifyUrl);

      setSuccessMsg(
        res.message ||
          'Thank you! Your wholesale order enquiry has been successfully recorded. Redirecting to WhatsApp...'
      );
      formElement.reset();

      // Directly open WhatsApp on client device to deliver notification straight to owner's phone
      window.location.href = notifyUrl;
    } else {
      setErrorMsg(res.error || 'Failed to submit enquiry. Please try reaching us directly on WhatsApp.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMsg && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">{successMsg}</p>
              <p className="text-xs text-emerald-700 mt-1">
                A direct notification is also dispatched to the owner&apos;s phone at +91 {ownerPhone}.
              </p>
            </div>
          </div>

          {ownerNotifyLink && (
            <div className="pt-2">
              <a
                href={ownerNotifyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notify Owner on WhatsApp Phone (+91 {ownerPhone})</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
              </a>
            </div>
          )}
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
