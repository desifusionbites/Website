'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { saveProductAction } from '@/lib/actions';
import { Product, Category, ProductVariant } from '@/types/database';
import { generateSlug, formatINR } from '@/lib/utils';
import { Upload, X, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';

interface ProductFormProps {
  categories: Category[];
  initialProduct?: Product | null;
}

export function ProductForm({ categories, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || '');
  const [milletType, setMilletType] = useState(initialProduct?.millet_type || '');
  const [flavour, setFlavour] = useState(initialProduct?.flavour || '');
  const [shortDesc, setShortDesc] = useState(initialProduct?.short_description || '');
  const [fullDesc, setFullDesc] = useState(initialProduct?.full_description || '');
  const [ingredients, setIngredients] = useState(initialProduct?.ingredients || '');
  const [allergens, setAllergens] = useState(initialProduct?.allergens || '');
  const [weight, setWeight] = useState(initialProduct?.weight || '');
  const [packSize, setPackSize] = useState(initialProduct?.pack_size || '');
  const [mrp, setMrp] = useState<string>(initialProduct?.mrp?.toString() || '');
  const [sellingPrice, setSellingPrice] = useState<string>(initialProduct?.selling_price?.toString() || '');
  const [wholesalePrice, setWholesalePrice] = useState<string>(initialProduct?.wholesale_price?.toString() || '');
  const [moq, setMoq] = useState<string>(initialProduct?.moq?.toString() || '1');
  const [availability, setAvailability] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>(
    initialProduct?.availability || 'in_stock'
  );
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured || false);
  const [isPublished, setIsPublished] = useState(initialProduct?.is_published || false);
  const [primaryImage, setPrimaryImage] = useState<string>(initialProduct?.primary_image_url || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(initialProduct?.gallery_images || []);
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seo_title || '');
  const [seoDesc, setSeoDesc] = useState(initialProduct?.seo_description || '');

  // Variants State
  const [variants, setVariants] = useState<Array<Partial<ProductVariant>>>(
    initialProduct?.variants && initialProduct.variants.length > 0
      ? initialProduct.variants
      : []
  );

  // Image Uploading State
  const [uploading, setUploading] = useState(false);

  function handleNameChange(val: string) {
    setName(val);
    if (!initialProduct) {
      setSlug(generateSlug(val));
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('bucket', 'products');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (isPrimary) {
          setPrimaryImage(data.url);
        } else {
          setGalleryImages((prev) => [...prev, data.url]);
        }
      } else {
        setErrorMsg(data.error || 'Image upload failed. You may also paste a direct image URL.');
      }
    } catch {
      setErrorMsg('Image upload failed. Please try pasting a direct image URL.');
    } finally {
      setUploading(false);
    }
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        title: 'New Pack Size',
        pack_size: '100g',
        mrp: null,
        selling_price: null,
        stock_status: 'in_stock',
        is_active: true,
      },
    ]);
  }

  function updateVariant(index: number, field: string, value: unknown) {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFormSubmit(publishStatus: boolean) {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      name,
      slug: slug || generateSlug(name),
      sku: sku || undefined,
      category_id: categoryId || undefined,
      millet_type: milletType || undefined,
      flavour: flavour || undefined,
      short_description: shortDesc || undefined,
      full_description: fullDesc || undefined,
      ingredients: ingredients || undefined,
      allergens: allergens || undefined,
      weight: weight || undefined,
      pack_size: packSize || undefined,
      mrp: mrp ? parseFloat(mrp) : undefined,
      selling_price: sellingPrice ? parseFloat(sellingPrice) : undefined,
      wholesale_price: wholesalePrice ? parseFloat(wholesalePrice) : undefined,
      moq: moq ? parseInt(moq, 10) : 1,
      availability,
      is_featured: isFeatured,
      is_published: publishStatus,
      primary_image_url: primaryImage || undefined,
      gallery_images: galleryImages,
      seo_title: seoTitle || undefined,
      seo_description: seoDesc || undefined,
    };

    const res = await saveProductAction(
      initialProduct?.id || null,
      payload,
      variants as any
    );

    setLoading(false);
    if (res.success) {
      setSuccessMsg(
        publishStatus
          ? 'Product published successfully! It is now live on the public website.'
          : 'Product saved as Draft. It is not publicly visible.'
      );
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } else {
      setErrorMsg(res.error || 'Failed to save product. Please check database connectivity.');
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-semibold">{successMsg}</div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* 1. Basic Product Identity */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-5">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
          1. Basic Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Bajra Masala Bites"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              URL Slug <span className="text-stone-400 font-normal">(auto-generated)</span>
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              placeholder="bajra-masala-bites"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-stone-50 font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Millet / Grain Type
            </label>
            <input
              type="text"
              value={milletType}
              onChange={(e) => setMilletType(e.target.value)}
              placeholder="e.g. Bajra, Jowar, Ragi, Roasted Mix"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Flavour / Taste Note
            </label>
            <input
              type="text"
              value={flavour}
              onChange={(e) => setFlavour(e.target.value)}
              placeholder="e.g. Tangy Tomato, Peri Peri, Desi Chatpata"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Short Description <span className="text-stone-400 font-normal">(appears on catalogue cards)</span>
          </label>
          <input
            type="text"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="Crispy, flavourful roasted bites prepared with traditional spices."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Full Product Description & Heritage Story
          </label>
          <textarea
            rows={4}
            value={fullDesc}
            onChange={(e) => setFullDesc(e.target.value)}
            placeholder="Provide complete details about the snack, texture, serving ideas, etc."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>
      </div>

      {/* 2. Real Product Photography & Media Upload */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-5">
        <div className="border-b border-stone-100 pb-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">
            2. Real Product Photos (Owner Uploads)
          </h2>
          <p className="text-xs text-stone-500">
            Upload genuine photographs of your packaged food products. No AI-generated representations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Primary Image */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-700">
              Primary Product Image
            </label>
            {primaryImage ? (
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-stone-200 group">
                <Image src={primaryImage} alt="Primary" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setPrimaryImage('')}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-48 h-48">
                <ImagePlaceholder text="No photo uploaded" aspectRatio="square" className="h-full" />
              </div>
            )}

            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold cursor-pointer border border-brand-200">
                <Upload className="w-4 h-4 text-brand-700" />
                <span>Upload Photo from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                />
              </label>

              <div className="text-[11px] text-stone-400">Or enter image URL directly:</div>
              <input
                type="url"
                value={primaryImage}
                onChange={(e) => setPrimaryImage(e.target.value)}
                placeholder="https://.../product.jpg"
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-stone-50"
              />
            </div>
          </div>

          {/* Gallery Images */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-700">
              Additional Gallery Images
            </label>
            <div className="flex flex-wrap gap-3">
              {galleryImages.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200">
                  <Image src={img} alt={`Gallery ${i}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setGalleryImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer border border-stone-300">
              <Plus className="w-4 h-4" />
              <span>Add Gallery Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, false)}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 3. Pricing, Packaging & Stock */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-5">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
          3. Pricing, Packaging & Inventory
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Selling Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="99.00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              MRP (₹) <span className="text-stone-400 font-normal">(Printed)</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              placeholder="120.00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Wholesale / Trade Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(e.target.value)}
              placeholder="75.00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Wholesale MOQ (Packs)
            </label>
            <input
              type="number"
              value={moq}
              onChange={(e) => setMoq(e.target.value)}
              placeholder="20"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Net Weight / Pack Size
            </label>
            <input
              type="text"
              value={weight || packSize}
              onChange={(e) => {
                setWeight(e.target.value);
                setPackSize(e.target.value);
              }}
              placeholder="e.g. 150g, 250g, 500g pouch"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Availability Status
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
            >
              <option value="in_stock">In Stock (Available)</option>
              <option value="low_stock">Low Stock (Few Left)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              SKU / Barcode
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="DFB-PK-001"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Product Variants (Optional) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              4. Product Variants (Weights & Pack Sizes)
            </h2>
            <p className="text-xs text-stone-500">
              Add multiple sizes (e.g. 100g, 250g, 500g) without creating duplicate products.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-stone-800 text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Variant</span>
          </button>
        </div>

        {variants.length > 0 ? (
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="p-4 bg-sand-50 rounded-xl border border-sand-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-xs">
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Variant Title</label>
                  <input
                    type="text"
                    value={v.title || ''}
                    onChange={(e) => updateVariant(i, 'title', e.target.value)}
                    placeholder="250g Family Pack"
                    className="w-full px-2.5 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Pack Size</label>
                  <input
                    type="text"
                    value={v.pack_size || ''}
                    onChange={(e) => updateVariant(i, 'pack_size', e.target.value)}
                    placeholder="250g"
                    className="w-full px-2.5 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={v.selling_price || ''}
                    onChange={(e) => updateVariant(i, 'selling_price', parseFloat(e.target.value) || null)}
                    placeholder="180"
                    className="w-full px-2.5 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={v.mrp || ''}
                    onChange={(e) => updateVariant(i, 'mrp', parseFloat(e.target.value) || null)}
                    placeholder="220"
                    className="w-full px-2.5 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                  />
                </div>
                <div className="flex items-center justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 py-2">No extra variants added. Standard single product mode active.</p>
        )}
      </div>

      {/* 5. Ingredients & Allergens */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-5">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
          5. Ingredients & Food Specifications
        </h2>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Ingredients List
          </label>
          <textarea
            rows={2}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. Bajra Flour, Rice Flour, Edible Vegetable Oil, Spices & Condiments, Rock Salt."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Allergen Advice
          </label>
          <input
            type="text"
            value={allergens}
            onChange={(e) => setAllergens(e.target.value)}
            placeholder="e.g. Made in a facility that also processes peanuts and sesame."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>
      </div>

      {/* 6. Visibility & Publishing Controls */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
        <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
          6. Publishing & Storefront Settings
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 border-stone-300"
            />
            <div>
              <span className="text-sm font-bold text-stone-900">Feature on Homepage</span>
              <p className="text-xs text-stone-500">Displays in the top featured picks section.</p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading || uploading}
            onClick={() => handleFormSubmit(false)}
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save as Draft'}
          </button>

          <button
            type="button"
            disabled={loading || uploading}
            onClick={() => handleFormSubmit(true)}
            className="w-full sm:w-auto px-8 py-3 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </span>
            ) : (
              'Publish to Website'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
