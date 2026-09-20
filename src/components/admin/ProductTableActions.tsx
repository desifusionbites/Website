'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/database';
import { saveProductAction, deleteProductAction } from '@/lib/actions';
import { Edit3, Eye, EyeOff, Trash2, Loader2, ExternalLink } from 'lucide-react';

interface ProductTableActionsProps {
  product: Product;
}

export function ProductTableActions({ product }: ProductTableActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleTogglePublish() {
    setLoading(true);
    await saveProductAction(product.id, {
      ...product,
      is_published: !product.is_published,
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    setLoading(true);
    await deleteProductAction(product.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Quick View */}
      {product.is_published && (
        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          title="View on Live Site"
          className="p-1.5 text-stone-500 hover:text-brand-700 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      )}

      {/* Quick Publish/Unpublish */}
      <button
        type="button"
        disabled={loading}
        onClick={handleTogglePublish}
        title={product.is_published ? 'Unpublish (Make Draft)' : 'Publish Live'}
        className={`p-1.5 rounded-lg transition-colors ${
          product.is_published
            ? 'text-amber-700 hover:bg-amber-50'
            : 'text-emerald-700 hover:bg-emerald-50'
        }`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : product.is_published ? (
          <EyeOff className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Edit Link */}
      <Link
        href={`/admin/products/${product.id}/edit`}
        title="Edit Product"
        className="p-1.5 text-stone-700 hover:text-brand-700 hover:bg-stone-100 rounded-lg transition-colors"
      >
        <Edit3 className="w-3.5 h-3.5" />
      </Link>

      {/* Delete */}
      <button
        type="button"
        disabled={loading}
        onClick={handleDelete}
        title="Delete Product"
        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
