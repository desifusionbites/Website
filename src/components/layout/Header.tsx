'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, MessageCircle, Phone, Sparkles, Truck } from 'lucide-react';
import { WebsiteSettings } from '@/types/database';
import { generateWhatsAppLink } from '@/lib/utils';
import { CartIcon } from '@/components/cart/CartIcon';
import { AccountButton } from '@/components/layout/AccountButton';

interface HeaderProps {
  settings: WebsiteSettings;
}

export function Header({ settings }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About Us' },
    { href: '/wholesale', label: 'Wholesale & B2B' },
    { href: '/track-order', label: 'Track Order' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQs' },
  ];

  const whatsAppLink = generateWhatsAppLink(
    settings.whatsapp || '9051941774',
    `Hello ${settings.brand_name || 'Desi Fusion Bites'}, I would like to know more about your packaged food products.`
  );

  return (
    <header className="sticky top-0 z-50 bg-sand-50/95 backdrop-blur-md border-b border-sand-200/80 shadow-sm transition-all">
      {/* Top micro bar with contact and FSSAI indicator */}
      <div className="bg-brand-900 text-brand-100 text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>{settings.tagline || 'Purana Swad Naya Tadka'}</span>
            </span>
            <span className="text-brand-300">|</span>
            <span className="text-brand-200 text-[11px]">
              FSSAI Lic. No: <strong className="text-white">{settings.fssai_license || '12826999000591'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/track-order" className="hover:text-white flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-brand-400" />
              <span>Track Order</span>
            </Link>
            <span className="text-brand-300">•</span>
            <a href={`tel:${settings.phone || '9051941774'}`} className="hover:text-white flex items-center gap-1">
              <Phone className="w-3 h-3 text-brand-400" />
              <span>+91 {settings.phone || '9051941774'}</span>
            </a>
            <span className="text-brand-300">•</span>
            <span>Hours: {settings.opening_hours || '8:00 AM - 8:00 PM'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 group">
            {settings.logo_url ? (
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden border border-brand-200 shadow-sm bg-white">
                <Image
                  src={settings.logo_url}
                  alt={settings.brand_name || 'Desi Fusion Bites'}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                  priority
                />
              </div>
            ) : (
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-brand-600 via-brand-700 to-spice-800 text-white flex items-center justify-center font-serif font-bold text-xl shadow-md border border-brand-500/30">
                DFB
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-brand-700 transition-colors">
                {settings.brand_name || 'Desi Fusion Bites'}
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-brand-700 tracking-wider uppercase">
                {settings.tagline || 'Purana Swad Naya Tadka'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-100/70 text-brand-900 font-semibold shadow-xs'
                      : 'text-stone-700 hover:text-brand-700 hover:bg-sand-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <CartIcon />
            <AccountButton />

            <div className="hidden sm:flex items-center gap-2">
              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-1 lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-stone-700 hover:bg-sand-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-sand-200 bg-sand-50/98 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-stone-800 hover:bg-sand-100 hover:text-brand-700'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-sand-200 flex flex-col gap-2">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-medium text-sm shadow"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp</span>
            </a>
            <div className="text-center text-xs text-stone-500 pt-2">
              FSSAI: {settings.fssai_license || '12826999000591'}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
