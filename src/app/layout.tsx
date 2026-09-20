import type { Metadata } from 'next';
import './globals.css';
import { getWebsiteSettings, getActivePromotions } from '@/lib/db';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://desifusionbites.com';

  return {
    title: {
      default: `${settings.brand_name || 'Desi Fusion Bites'} | ${settings.tagline || 'Purana Swad Naya Tadka'}`,
      template: `%s | ${settings.brand_name || 'Desi Fusion Bites'}`,
    },
    description:
      settings.hero_subtitle ||
      'Authentic Indian packaged food brand bringing traditional taste with a modern touch. Freshly prepared snacks, traditional recipes, and pure ingredients. FSSAI Certified.',
    metadataBase: new URL(siteUrl),
    keywords: [
      'Desi Fusion Bites',
      'Purana Swad Naya Tadka',
      'Indian Packaged Food',
      'Indian Snacks',
      'Millet Snacks',
      'West Bengal Food Brand',
      'Aruna Harlalka',
      'Bhadrakali Uttarpara Snacks',
      'FSSAI 12826999000591',
    ],
    authors: [{ name: settings.proprietor || 'Aruna Harlalka' }],
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: siteUrl,
      title: `${settings.brand_name || 'Desi Fusion Bites'} - ${settings.tagline || 'Purana Swad Naya Tadka'}`,
      description:
        settings.hero_subtitle ||
        'Authentic Indian packaged snacks made with pure ingredients and traditional recipes.',
      siteName: settings.brand_name || 'Desi Fusion Bites',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getWebsiteSettings();
  const promotions = await getActivePromotions();

  // JSON-LD Organization & LocalBusiness Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.brand_name || 'Desi Fusion Bites',
    description: settings.tagline || 'Purana Swad Naya Tadka',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://desifusionbites.com',
    telephone: `+91-${settings.phone || '9051941774'}`,
    email: settings.email || 'desifusionbites@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${settings.address_line1 || '275 Dwarika Jungle Road'}, ${settings.address_line2 || 'P.O. Bhadrakali, P.S. Uttarpara'}`,
      addressLocality: settings.district || 'Hooghly District',
      addressRegion: settings.state || 'West Bengal',
      postalCode: settings.pincode || '712232',
      addressCountry: 'IN',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '20:00',
    },
    founder: {
      '@type': 'Person',
      name: settings.proprietor || 'Aruna Harlalka',
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-sand-50 text-stone-900 selection:bg-brand-200 selection:text-brand-900">
        <AnnouncementBar promotions={promotions} />
        <Header settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <FloatingWhatsApp
          phone={settings.whatsapp || '9051941774'}
          brandName={settings.brand_name || 'Desi Fusion Bites'}
        />
      </body>
    </html>
  );
}
