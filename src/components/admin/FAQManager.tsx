'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FAQ } from '@/types/database';
import { saveFAQAction, deleteFAQAction } from '@/lib/actions';
import { Plus, Edit2, Trash2, HelpCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface FAQManagerProps {
  initialFAQs: FAQ[];
}

export function FAQManager({ initialFAQs }: FAQManagerProps) {
  const router = useRouter();
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('General');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function startEdit(faq: FAQ) {
    setEditingFAQ(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || 'General');
    setDisplayOrder(faq.display_order || 0);
    setIsPublished(faq.is_published);
  }

  function resetForm() {
    setEditingFAQ(null);
    setQuestion('');
    setAnswer('');
    setCategory('General');
    setDisplayOrder(0);
    setIsPublished(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await saveFAQAction(editingFAQ?.id || null, {
      question,
      answer,
      category,
      display_order: displayOrder,
      is_published: isPublished,
    });

    setLoading(false);
    if (res.success) {
      setSuccessMsg(editingFAQ ? 'FAQ updated successfully!' : 'FAQ created successfully!');
      resetForm();
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Failed to save FAQ.');
    }
  }

  async function handleDelete(id: string, q: string) {
    if (!confirm(`Delete FAQ: "${q}"?`)) return;
    setLoading(true);
    await deleteFAQAction(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
          {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
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
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Are your millet snacks gluten-free?"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Answer <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a helpful and clear answer..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              >
                <option value="General">General</option>
                <option value="Products & Ingredients">Products & Ingredients</option>
                <option value="Ordering & Shipping">Ordering & Shipping</option>
                <option value="Wholesale & Bulk">Wholesale & Bulk</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded"
            />
            <span className="text-xs font-semibold text-stone-800">Published & Visible to Customers</span>
          </label>

          <div className="flex items-center gap-2 pt-2">
            {editingFAQ && (
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
              ) : editingFAQ ? (
                'Update FAQ'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add FAQ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: List */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
          Published & Draft FAQs ({initialFAQs.length})
        </h2>

        {initialFAQs.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {initialFAQs.map((faq) => (
              <div key={faq.id} className="py-3.5 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{faq.question}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        faq.is_published
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {faq.is_published ? 'Active' : 'Draft'}
                    </span>
                    <span className="text-[10px] bg-sand-100 text-sand-800 font-semibold px-2 py-0.5 rounded-md">
                      {faq.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(faq)}
                      className="p-1.5 text-stone-700 hover:text-brand-700 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(faq.id, faq.question)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pr-8">{faq.answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400 space-y-2">
            <HelpCircle className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-xs">No FAQs entered yet. Add one using the form on the left.</p>
          </div>
        )}
      </div>
    </div>
  );
}
