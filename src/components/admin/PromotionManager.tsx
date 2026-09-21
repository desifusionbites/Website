'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Promotion } from '@/types/database';
import { savePromotionAction, deletePromotionAction } from '@/lib/actions';
import { Plus, Edit2, Trash2, Megaphone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PromotionManagerProps {
  initialPromotions: Promotion[];
}

export function PromotionManager({ initialPromotions }: PromotionManagerProps) {
  const router = useRouter();
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [title, setTitle] = useState('');
  const [bannerText, setBannerText] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function startEdit(p: Promotion) {
    setEditingPromo(p);
    setTitle(p.title);
    setBannerText(p.banner_text);
    setBadgeText(p.badge_text || '');
    setCtaLabel(p.cta_label || '');
    setCtaUrl(p.cta_url || '');
    setIsActive(p.is_active);
  }

  function resetForm() {
    setEditingPromo(null);
    setTitle('');
    setBannerText('');
    setBadgeText('');
    setCtaLabel('');
    setCtaUrl('');
    setIsActive(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await savePromotionAction(editingPromo?.id || null, {
      title,
      banner_text: bannerText,
      badge_text: badgeText,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      is_active: isActive,
    });

    setLoading(false);
    if (res.success) {
      setSuccessMsg(
        editingPromo ? 'Promotion banner updated!' : 'Promotion banner created!'
      );
      resetForm();
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Failed to save promotion.');
    }
  }

  async function handleDelete(id: string, promoTitle: string) {
    if (!confirm(`Delete promotion "${promoTitle}"?`)) return;
    setLoading(true);
    await deletePromotionAction(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Form */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
          {editingPromo ? 'Edit Promotion Banner' : 'Create Promotion Banner'}
        </h2>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Internal Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Navratri Festival Special"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Banner Announcement Text <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="e.g. Free pan-India delivery on all orders above ₹499! Use code FESTIVE."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Badge Tag (Optional)
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="e.g. FESTIVE OFFER"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="e.g. Shop Now"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              CTA Link URL (Optional)
            </label>
            <input
              type="text"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="e.g. /products"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded"
            />
            <span className="text-xs font-semibold text-stone-800">Active & Displaying on Storefront</span>
          </label>

          <div className="flex items-center gap-2 pt-2">
            {editingPromo && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-200"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingPromo ? (
                'Update Promotion'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Promotion</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right: List */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
          Current Promotions & Banners ({initialPromotions.length})
        </h2>

        {initialPromotions.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {initialPromotions.map((p) => (
              <div key={p.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {p.badge_text && (
                      <span className="bg-brand-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {p.badge_text}
                      </span>
                    )}
                    <span className="font-bold text-stone-900 text-sm">{p.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="p-1.5 text-stone-700 hover:text-brand-700 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.title)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-sand-50 rounded-xl text-xs text-stone-700 border border-sand-200">
                  <p className="font-medium">{p.banner_text}</p>
                  {p.cta_label && (
                    <div className="mt-1 text-[11px] text-brand-700 font-bold">
                      Button: &ldquo;{p.cta_label}&rdquo; &rarr; {p.cta_url || '#'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400 space-y-2">
            <Megaphone className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-xs">No promotions configured yet. Add one using the form on the left.</p>
          </div>
        )}
      </div>
    </div>
  );
}
