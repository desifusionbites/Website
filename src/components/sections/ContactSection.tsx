import React from 'react';
import { Phone, Mail, MapPin, Clock, ShieldCheck, MessageCircle } from 'lucide-react';
import { WebsiteSettings } from '@/types/database';
import { generateWhatsAppLink } from '@/lib/utils';
import { EnquiryForm } from '@/components/forms/EnquiryForm';

interface ContactSectionProps {
  settings: WebsiteSettings;
  title?: string;
  subtitle?: string;
}

export function ContactSection({
  settings,
  title = 'Get In Touch',
  subtitle = 'We would love to hear from you. Reach out for retail orders, distribution, or queries.',
}: ContactSectionProps) {
  const whatsAppLink = generateWhatsAppLink(
    settings.whatsapp || '9051941774',
    'Hello Desi Fusion Bites, I would like to get in touch regarding your packaged foods.'
  );

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-700">
            Contact Desi Fusion Bites
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">{title}</h2>
          <p className="text-sm sm:text-base text-stone-600">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Column: Direct Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-sand-50 rounded-2xl p-6 sm:p-8 border border-sand-200 space-y-6">
              <h3 className="font-serif text-xl font-bold text-stone-900 border-b border-sand-200 pb-3">
                Business Information
              </h3>

              <div className="space-y-4 text-sm text-stone-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900">Address:</strong>
                    <span>
                      {settings.address_line1 || '275 Dwarika Jungle Road'}, {settings.address_line2 || 'P.O. Bhadrakali, P.S. Uttarpara'}, {settings.district || 'Hooghly District'}, {settings.state || 'West Bengal'} - {settings.pincode || '712232'}, India
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-700 shrink-0" />
                  <div>
                    <strong className="block text-stone-900">Phone & WhatsApp:</strong>
                    <a href={`tel:${settings.phone || '9051941774'}`} className="text-brand-800 hover:underline font-medium">
                      +91 {settings.phone || '9051941774'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-700 shrink-0" />
                  <div>
                    <strong className="block text-stone-900">Email:</strong>
                    <a href={`mailto:${settings.email || 'desifusionbites@gmail.com'}`} className="text-brand-800 hover:underline font-medium break-all">
                      {settings.email || 'desifusionbites@gmail.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-brand-700 shrink-0" />
                  <div>
                    <strong className="block text-stone-900">Operating Hours:</strong>
                    <span>{settings.opening_hours || '8:00 AM to 8:00 PM'} (Mon - Sun)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <strong className="block text-stone-900">FSSAI License:</strong>
                    <span className="font-mono text-stone-800">{settings.fssai_license || '12826999000591'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat With Us on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-sand-200 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              Send an Online Message
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mb-6">
              Fill out the details below and our team will get back to you promptly.
            </p>
            <EnquiryForm defaultType="general" />
          </div>
        </div>
      </div>
    </section>
  );
}
