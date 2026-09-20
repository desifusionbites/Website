import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, Instagram, Youtube, Lock } from 'lucide-react';
import { WebsiteSettings } from '@/types/database';

interface FooterProps {
  settings: WebsiteSettings;
}

export function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* 1. Brand & Proprietor Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-white p-1">
                  <Image
                    src={settings.logo_url}
                    alt={settings.brand_name || 'Desi Fusion Bites'}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center font-serif font-bold text-lg">
                  DFB
                </div>
              )}
              <div>
                <h3 className="font-serif text-xl font-bold text-white tracking-wide">
                  {settings.brand_name || 'Desi Fusion Bites'}
                </h3>
                <p className="text-xs text-brand-400 font-medium">
                  {settings.tagline || 'Purana Swad Naya Tadka'}
                </p>
              </div>
            </div>

            <p className="text-sm text-stone-400 leading-relaxed">
              {settings.footer_text || 'Authentic Indian packaged food and snack delights made with quality ingredients and traditional recipes.'}
            </p>

            <div className="pt-2 border-t border-stone-800 text-xs text-stone-400 space-y-1">
              <div><strong className="text-stone-300">Proprietor:</strong> {settings.proprietor || 'Aruna Harlalka'}</div>
              <div><strong className="text-stone-300">Contact Person:</strong> {settings.contact_person || 'Priya Harlalka'}</div>
            </div>

            <div className="inline-flex items-center gap-2 bg-stone-800/80 border border-brand-800/60 rounded-lg px-3 py-1.5 text-xs text-brand-300">
              <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
              <span>FSSAI Lic. No: <strong className="text-white">{settings.fssai_license || '12826999000591'}</strong></span>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white uppercase tracking-wider mb-4 border-b border-stone-800 pb-2">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-brand-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-brand-400 transition-colors">
                  Product Catalogue
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-400 transition-colors">
                  Our Story & Heritage
                </Link>
              </li>
              <li>
                <Link href="/wholesale" className="hover:text-brand-400 transition-colors">
                  Wholesale & Distributor Supply
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-400 transition-colors">
                  Contact & Location
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Contact Details */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white uppercase tracking-wider mb-4 border-b border-stone-800 pb-2">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-1" />
                <span className="leading-snug">
                  {settings.address_line1 || '275 Dwarika Jungle Road'}, {settings.address_line2 || 'P.O. Bhadrakali, P.S. Uttarpara'}, {settings.district || 'Hooghly District'}, {settings.state || 'West Bengal'} - {settings.pincode || '712232'}, India
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href={`tel:${settings.phone || '9051941774'}`} className="hover:text-brand-400 transition-colors">
                  +91 {settings.phone || '9051941774'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href={`mailto:${settings.email || 'desifusionbites@gmail.com'}`} className="hover:text-brand-400 transition-colors break-all">
                  {settings.email || 'desifusionbites@gmail.com'}
                </a>
              </li>
            </ul>

            {/* Social media links */}
            <div className="mt-5 flex items-center gap-3">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 hover:text-pink-400 hover:bg-stone-700 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-stone-700 transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* 4. Legal & Policies */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white uppercase tracking-wider mb-4 border-b border-stone-800 pb-2">
              Policies
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-brand-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-brand-400 transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-brand-400 transition-colors">
                  Cancellation & Refund Policy
                </Link>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-stone-800">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand-400 transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>Business Admin Login</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>
            © {currentYear} {settings.brand_name || 'Desi Fusion Bites'}. All rights reserved.
          </p>
          <p className="text-stone-400">
            FSSAI: {settings.fssai_license || '12826999000591'} • Hooghly, West Bengal
          </p>
        </div>
      </div>
    </footer>
  );
}
