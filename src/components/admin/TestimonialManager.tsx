'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Testimonial } from '@/types/database';
import { saveTestimonialAction, deleteTestimonialAction } from '@/lib/actions';
import { Plus, Edit2, Trash2, Star, MessageSquareQuote, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface TestimonialManagerProps {
  initialTestimonials: Testimonial[];
}

export function TestimonialManager({ initialTestimonials }: TestimonialManagerProps) {
  const router = useRouter();
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [location, setLocation] = useState('India');
  const [productReference, setProductReference] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function startEdit(t: Testimonial) {
    setEditingTestimonial(t);
    setCustomerName(t.customer_name);
    setReviewText(t.review_text);
    setRating(t.rating);
    setLocation(t.location || 'India');
    setProductReference(t.product_reference || '');
    setDisplayOrder(t.display_order || 0);
    setIsPublished(t.is_published);
  }

  function resetForm() {
    setEditingTestimonial(null);
    setCustomerName('');
    setReviewText('');
    setRating(5);
    setLocation('India');
    setProductReference('');
    setDisplayOrder(0);
    setIsPublished(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await saveTestimonialAction(editingTestimonial?.id || null, {
      customer_name: customerName,
      review_text: reviewText,
      rating,
      location,
      product_reference: productReference,
      display_order: displayOrder,
      is_published: isPublished,
    });

    setLoading(false);
    if (res.success) {
      setSuccessMsg(
        editingTestimonial ? 'Review updated successfully!' : 'Review created successfully!'
      );
      resetForm();
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Failed to save review.');
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete review from "${name}"?`)) return;
    setLoading(true);
    await deleteTestimonialAction(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
          {editingTestimonial ? 'Edit Customer Review' : 'Add Verified Review'}
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
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Customer Feedback / Review <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="e.g. The Jowar Crisp is crunchy and fresh! Reminds me of traditional home snacks."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Rating (1 - 5 Stars)
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              >
                <option value={5}>5 Stars (⭐⭐⭐⭐⭐)</option>
                <option value={4}>4 Stars (⭐⭐⭐⭐)</option>
                <option value={3}>3 Stars (⭐⭐⭐)</option>
                <option value={2}>2 Stars (⭐⭐)</option>
                <option value={1}>1 Star (⭐)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Location (City / State)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune, Maharashtra"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Referenced Snack / Product (Optional)
            </label>
            <input
              type="text"
              value={productReference}
              onChange={(e) => setProductReference(e.target.value)}
              placeholder="e.g. Peri Peri Millet Chips"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded"
            />
            <span className="text-xs font-semibold text-stone-800">Published & Displayed on Homepage</span>
          </label>

          <div className="flex items-center gap-2 pt-2">
            {editingTestimonial && (
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
              ) : editingTestimonial ? (
                'Update Review'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: List */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
          Verified Reviews ({initialTestimonials.length})
        </h2>

        {initialTestimonials.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {initialTestimonials.map((t) => (
              <div key={t.id} className="p-4 bg-sand-50 rounded-2xl border border-sand-200 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{t.customer_name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.is_published
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {t.is_published ? 'Published' : 'Hidden'}
                    </span>
                    {t.product_reference && (
                      <span className="text-[10px] bg-white text-stone-600 px-2 py-0.5 rounded border border-stone-200">
                        {t.product_reference}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      className="p-1.5 text-stone-700 hover:text-brand-700 hover:bg-white rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id, t.customer_name)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-stone-700 italic">&ldquo;{t.review_text}&rdquo;</p>
                <div className="text-[11px] text-stone-400">{t.location || 'India'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400 space-y-2">
            <MessageSquareQuote className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-xs">No reviews entered yet. Add reviews using the form on the left.</p>
          </div>
        )}
      </div>
    </div>
  );
}
