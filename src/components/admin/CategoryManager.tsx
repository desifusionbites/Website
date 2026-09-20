'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types/database';
import { saveCategoryAction, deleteCategoryAction } from '@/lib/actions';
import { Plus, Edit2, Trash2, Layers, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateSlug } from '@/lib/utils';

interface CategoryManagerProps {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function startEdit(cat: Category) {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setIsPublished(cat.is_published);
  }

  function resetForm() {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setIsPublished(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await saveCategoryAction(editingCategory?.id || null, {
      name,
      slug: slug || generateSlug(name),
      description,
      image_url: imageUrl || undefined,
      is_published: isPublished,
    });

    setLoading(false);
    if (res.success) {
      setSuccessMsg(
        editingCategory ? 'Category updated successfully!' : 'Category created successfully!'
      );
      resetForm();
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Failed to save category.');
    }
  }

  async function handleDelete(id: string, catName: string) {
    if (!confirm(`Delete category "${catName}"?`)) return;
    setLoading(true);
    await deleteCategoryAction(id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Create/Edit Form */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
          {editingCategory ? 'Edit Category' : 'Create New Category'}
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
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingCategory) setSlug(generateSlug(e.target.value));
              }}
              placeholder="e.g. Traditional Bites"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Slug
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              placeholder="traditional-bites"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono bg-stone-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this snack category"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Category Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://.../category.jpg"
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
            <span className="text-xs font-semibold text-stone-800">Published & Visible</span>
          </label>

          <div className="flex items-center gap-2 pt-2">
            {editingCategory && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-200"
              >
                Cancel Edit
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingCategory ? (
                'Update Category'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right: Existing Categories List */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
          Current Categories ({initialCategories.length})
        </h2>

        {initialCategories.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {initialCategories.map((cat) => (
              <div key={cat.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{cat.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.is_published
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {cat.is_published ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <div className="text-xs text-stone-400 font-mono">/{cat.slug}</div>
                  {cat.description && (
                    <p className="text-xs text-stone-600 line-clamp-1">{cat.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(cat)}
                    className="p-1.5 text-stone-700 hover:text-brand-700 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400 space-y-2">
            <Layers className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-xs">No categories created yet. Add one using the form on the left.</p>
          </div>
        )}
      </div>
    </div>
  );
}
