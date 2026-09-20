import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/lib/db';
import { PlusCircle, Sparkles, PackageOpen } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { ProductTableActions } from '@/components/admin/ProductTableActions';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getProducts({ includeUnpublished: true });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Product Catalogue Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Create, edit, price, and publish packaged snacks.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Products Table */}
      {products.length > 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 uppercase font-semibold text-stone-500 text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Pack Size</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-sand-100 shrink-0 border border-stone-200">
                        {prod.primary_image_url ? (
                          <Image src={prod.primary_image_url} alt={prod.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 bg-sand-50">
                            No photo
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 flex items-center gap-1.5">
                          <span>{prod.name}</span>
                          {prod.is_featured && (
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          /{prod.slug}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {prod.category ? (
                        <span className="bg-sand-100 text-stone-700 px-2 py-0.5 rounded font-medium text-[11px]">
                          {prod.category.name}
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4 font-semibold text-stone-900">
                      {prod.selling_price ? formatINR(prod.selling_price) : '—'}
                      {prod.mrp && prod.selling_price && prod.mrp > prod.selling_price && (
                        <div className="text-[10px] text-stone-400 line-through font-normal">
                          {formatINR(prod.mrp)}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-stone-600">
                      {prod.weight || prod.pack_size || '—'}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.availability === 'in_stock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prod.availability === 'low_stock'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {prod.availability.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          prod.is_published
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {prod.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <ProductTableActions product={prod} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center max-w-lg mx-auto space-y-4">
          <PackageOpen className="w-12 h-12 text-stone-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              No Products Created Yet
            </h3>
            <p className="text-xs text-stone-500">
              Get started by creating your first packaged snack product.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Product</span>
          </Link>
        </div>
      )}
    </div>
  );
}
