import React from 'react';
import { getWebsiteSettings, getWebsiteSections } from '@/lib/db';
import { WebsiteContentEditor } from '@/components/admin/WebsiteContentEditor';

export const revalidate = 0;

export default async function AdminContentPage() {
  const [settings, sections] = await Promise.all([
    getWebsiteSettings(),
    getWebsiteSections(),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Website Content & Branding Editor
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Customize brand logos, tagline, contact numbers, address, FSSAI license, social channels, and homepage sections.
        </p>
      </div>

      <WebsiteContentEditor initialSettings={settings} initialSections={sections} />
    </div>
  );
}
