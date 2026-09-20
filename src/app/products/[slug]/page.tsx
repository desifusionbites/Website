import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getWebsiteSettings } from '@/lib/db';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductVariantSelector } from '@/components/products/ProductVariantSelector';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug, false);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const title = product.seo_title || `${product.name} | Desi Fusion Bites`;
  const description =
    product.seo_description ||
    product.short_description ||
    `Order ${product.name} online from Desi Fusion Bites. Authentic Indian packaged food with rich taste and quality.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.primary_image_url ? [{ url: product.primary_image_url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug, false),
    getWebsiteSettings(),
  ]);

  if (!product) {
    notFound();
  }

  // Schema.org Product structured data
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || product.full_description,
    image: product.primary_image_url || undefined,
    sku: product.sku || undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.selling_price || 0,
      availability:
        product.availability === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: settings.brand_name || 'Desi Fusion Bites',
      },
    },
  };

  return (
    <div className="bg-sand-50/40 min-h-screen py-8 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
          <Link href="/" className="hover:text-brand-700">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-brand-700">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-700">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-stone-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-sand-200 shadow-xs">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-6">
            <ProductGallery
              primaryImage={product.primary_image_url}
              galleryImages={product.gallery_images}
              productName={product.name}
            />
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {product.category && (
                  <span className="text-xs font-semibold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                    {product.category.name}
                  </span>
                )}
                {product.millet_type && (
                  <span className="text-xs bg-sand-100 px-2.5 py-1 rounded-md text-stone-700 font-medium">
                    Type: {product.millet_type}
                  </span>
                )}
                {product.flavour && (
                  <span className="text-xs bg-sand-100 px-2.5 py-1 rounded-md text-stone-700 font-medium">
                    Flavour: {product.flavour}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                {product.name}
              </h1>

              {product.short_description && (
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                  {product.short_description}
                </p>
              )}
            </div>

            {/* Variant Selector & WhatsApp Order Button */}
            <ProductVariantSelector
              product={product}
              whatsappPhone={settings.whatsapp || '9051941774'}
            />

            {/* Product Full Details Accordion / Tabs */}
            <div className="border-t border-sand-200 pt-6 space-y-5 text-sm">
              {product.full_description && (
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    Description & Taste Profile
                  </h3>
                  <div className="text-stone-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                    {product.full_description}
                  </div>
                </div>
              )}

              {product.ingredients && (
                <div className="space-y-1.5 p-4 rounded-xl bg-sand-50 border border-sand-200">
                  <h4 className="font-semibold text-xs text-stone-900 uppercase tracking-wider">
                    Ingredients:
                  </h4>
                  <p className="text-stone-700 text-xs leading-relaxed">
                    {product.ingredients}
                  </p>
                </div>
              )}

              {product.allergens && (
                <div className="space-y-1 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <strong>Allergen Advice:</strong> {product.allergens}
                </div>
              )}

              {/* FSSAI & Brand Authenticity Bar */}
              <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">FSSAI Certified Product</div>
                    <div className="text-[11px] text-stone-400">License No. {settings.fssai_license || '12826999000591'}</div>
                  </div>
                </div>
                <span className="text-[11px] text-brand-300 font-serif">Desi Fusion Bites</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Inquire & Bulk Order Form */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-sand-200 shadow-xs space-y-4">
          <div className="max-w-xl space-y-1">
            <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>Ask a Question or Bulk Enquiry for {product.name}</span>
            </h3>
            <p className="text-xs text-stone-600">
              Need custom packaging, bulk cartons, or party packs? Send us a quick note.
            </p>
          </div>
          <EnquiryForm defaultType="product" productName={product.name} />
        </div>
      </div>
    </div>
  );
}
