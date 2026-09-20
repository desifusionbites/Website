import React from 'react';
import type { Metadata } from 'next';
import { getWebsiteSettings } from '@/lib/db';
import { ContactSection } from '@/components/sections/ContactSection';

export const metadata: Metadata = {
  title: 'Contact Us | Location & Inquiries',
  description:
    'Contact Desi Fusion Bites. Address: 275 Dwarika Jungle Road, Bhadrakali, Uttarpara, Hooghly, West Bengal - 712232. Phone & WhatsApp: 9051941774.',
};

export const revalidate = 0;

export default async function ContactPage() {
  const settings = await getWebsiteSettings();

  return (
    <div className="bg-sand-50/50 min-h-screen">
      <ContactSection
        settings={settings}
        title="Contact Desi Fusion Bites"
        subtitle="Reach out for customer queries, custom bulk orders, or visit us in Hooghly District, West Bengal."
      />
    </div>
  );
}
