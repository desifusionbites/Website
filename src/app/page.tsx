import React from 'react';
import {
  getWebsiteSettings,
  getWebsiteSections,
  getCategories,
  getProducts,
  getTestimonials,
} from '@/lib/db';
import { HeroSection } from '@/components/sections/HeroSection';
import { CategoriesSection } from '@/components/sections/CategoriesSection';
import { FeaturedProductsSection } from '@/components/sections/FeaturedProductsSection';
import { StorySection } from '@/components/sections/StorySection';
import { WholesaleCTASection } from '@/components/sections/WholesaleCTASection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { ContactSection } from '@/components/sections/ContactSection';

export const revalidate = 0; // Fresh dynamic data on every request

export default async function HomePage() {
  const [settings, sections, categories, featuredProducts, testimonials] =
    await Promise.all([
      getWebsiteSettings(),
      getWebsiteSections(),
      getCategories(false),
      getProducts({ featuredOnly: true, includeUnpublished: false }),
      getTestimonials(false),
    ]);

  // Section lookup helper
  const sectionMap = new Map(sections.map((s) => [s.id, s]));

  const renderSection = (id: string) => {
    const s = sectionMap.get(id);
    if (s && !s.is_enabled) return null;

    switch (id) {
      case 'hero':
        return <HeroSection key="hero" settings={settings} />;
      case 'categories':
        return (
          <CategoriesSection
            key="categories"
            categories={categories}
            title={s?.title || undefined}
            subtitle={s?.subtitle || undefined}
          />
        );
      case 'featured_products':
        return (
          <FeaturedProductsSection
            key="featured_products"
            products={featuredProducts}
            title={s?.title || undefined}
            subtitle={s?.subtitle || undefined}
            whatsappPhone={settings.whatsapp || '9051941774'}
          />
        );
      case 'story_preview':
        return <StorySection key="story_preview" settings={settings} title={s?.title || undefined} />;
      case 'wholesale_cta':
        return (
          <WholesaleCTASection
            key="wholesale_cta"
            phone={settings.phone || '9051941774'}
            title={s?.title || undefined}
            subtitle={s?.subtitle || undefined}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsSection
            key="testimonials"
            testimonials={testimonials}
            title={s?.title || undefined}
            subtitle={s?.subtitle || undefined}
          />
        );
      case 'contact_preview':
        return (
          <ContactSection
            key="contact_preview"
            settings={settings}
            title={s?.title || undefined}
            subtitle={s?.subtitle || undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      {sections.map((sec) => renderSection(sec.id))}
    </div>
  );
}
