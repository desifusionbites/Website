import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getWebsiteSettings } from '@/lib/db';
import { ShieldCheck, Sparkles, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Business Background',
  description:
    'About Desi Fusion Bites. Proprietor: Aruna Harlalka, Contact Person: Priya Harlalka. FSSAI License: 12826999000591, located in Hooghly District, West Bengal.',
};

export const revalidate = 0;

export default async function AboutPage() {
  const settings = await getWebsiteSettings();

  const storyParagraphs = settings.story_paragraphs || [
    'Desi Fusion Bites is an Indian packaged food brand managed by proprietor Aruna Harlalka and contact lead Priya Harlalka.',
    'Operating under FSSAI License No. 12826999000591, located at 275 Dwarika Jungle Road, P.O. Bhadrakali, P.S. Uttarpara, Hooghly District, West Bengal - 712232.',
  ];

  return (
    <div className="bg-sand-50/50 min-h-screen py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Page Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Business Information</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-stone-900">
            {settings.story_title || 'About Desi Fusion Bites'}
          </h1>
          <p className="text-base sm:text-lg text-brand-800 font-medium">
            &quot;{settings.tagline || 'Purana Swad Naya Tadka'}&quot;
          </p>
        </div>

        {/* Hero Visual Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sand-200 shadow-sm space-y-8">
          {settings.about_image_url && (
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md">
              <Image
                src={settings.about_image_url}
                alt="Desi Fusion Bites Story"
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-5 text-stone-700 text-base sm:text-lg leading-relaxed">
            {storyParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Key Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-sand-200">
            <div className="space-y-2 p-5 rounded-2xl bg-sand-50 border border-sand-200">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <h3 className="font-serif font-bold text-stone-900 text-base">FSSAI License</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-mono">
                {settings.fssai_license || '12826999000591'}
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-sand-50 border border-sand-200">
              <MapPin className="w-6 h-6 text-brand-700" />
              <h3 className="font-serif font-bold text-stone-900 text-base">Location</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hooghly District, West Bengal - 712232
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-sand-50 border border-sand-200">
              <Clock className="w-6 h-6 text-spice-700" />
              <h3 className="font-serif font-bold text-stone-900 text-base">Hours</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {settings.opening_hours || '8:00 AM to 8:00 PM'}
              </p>
            </div>
          </div>
        </div>

        {/* Business Leadership & Location */}
        <div className="bg-stone-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold border-b border-stone-800 pb-4">
            Business Leadership & Origin
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-stone-300">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Management</h3>
              <p><strong>Proprietor:</strong> {settings.proprietor || 'Aruna Harlalka'}</p>
              <p><strong>Contact Person:</strong> {settings.contact_person || 'Priya Harlalka'}</p>
              <p><strong>Brand:</strong> Desi Fusion Bites</p>
              <p><strong>Operating Hours:</strong> {settings.opening_hours || '8:00 AM - 8:00 PM'}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Manufacturing & Business Address</span>
              </h3>
              <p className="leading-relaxed">
                {settings.address_line1 || '275 Dwarika Jungle Road'},<br />
                {settings.address_line2 || 'P.O. Bhadrakali, P.S. Uttarpara'},<br />
                {settings.district || 'Hooghly District'}, {settings.state || 'West Bengal'} - {settings.pincode || '712232'}, India
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
