'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { WebsiteSettings, WebsiteSection } from '@/types/database';
import { updateWebsiteSettingsAction, toggleSectionAction } from '@/lib/actions';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  X,
  Sparkles,
  Phone,
  Share2,
  Layout,
  FileText,
} from 'lucide-react';

interface WebsiteContentEditorProps {
  initialSettings: WebsiteSettings;
  initialSections: WebsiteSection[];
}

export function WebsiteContentEditor({
  initialSettings,
  initialSections,
}: WebsiteContentEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'branding' | 'business' | 'social' | 'sections' | 'story'>('branding');

  const [settings, setSettings] = useState<WebsiteSettings>(initialSettings);
  const [sections, setSections] = useState<WebsiteSection[]>(initialSections);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleFieldChange(field: keyof WebsiteSettings, value: unknown) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateWebsiteSettingsAction(settings);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Website settings saved successfully! Changes are immediately live.');
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Failed to save settings.');
    }
  }

  async function handleToggleSection(sectionId: string, currentVal: boolean) {
    const newVal = !currentVal;
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, is_enabled: newVal } : s))
    );
    await toggleSectionAction(sectionId, newVal);
    router.refresh();
  }

  async function handleImageUpload(
    field: 'logo_url' | 'hero_image_url' | 'about_image_url',
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'branding');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setSettings((prev) => ({ ...prev, [field]: data.url }));
        setSuccessMsg('Image uploaded successfully! Click Save All Website Settings below to publish.');
      } else {
        setErrorMsg(data.error || 'Image upload failed');
      }
    } catch {
      setErrorMsg('Image upload failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'branding'
              ? 'bg-brand-700 text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Branding & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('business')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'business'
              ? 'bg-brand-700 text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Business Details & FSSAI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'social'
              ? 'bg-brand-700 text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Media Links</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'sections'
              ? 'bg-brand-700 text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Homepage Sections</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('story')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
            activeTab === 'story'
              ? 'bg-brand-700 text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>About Story</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 text-xs flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* TAB 1: BRANDING */}
        {activeTab === 'branding' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-5">
            <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Brand Identity & Logos
            </h2>

            {/* Logo upload */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-700">Brand Logo</label>
              <div className="flex items-center gap-5">
                {settings.logo_url ? (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-stone-200 bg-white p-1">
                    <Image src={settings.logo_url} alt="Logo" fill className="object-contain" />
                    <button
                      type="button"
                      onClick={() => handleFieldChange('logo_url', null)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-sand-100 flex items-center justify-center text-xs text-stone-400 font-serif font-bold text-xl border border-dashed border-sand-300">
                    DFB
                  </div>
                )}

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold cursor-pointer border border-brand-200 transition-colors">
                    <Upload className="w-4 h-4 text-brand-700" />
                    <span>Upload Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('logo_url', e)}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-stone-400">PNG, JPG, or SVG with transparent background recommended.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.brand_name}
                  onChange={(e) => handleFieldChange('brand_name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tagline <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.tagline}
                  onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
            </div>

            {/* Hero Visual Image & Hero Texts */}
            <div className="pt-4 border-t border-stone-100 space-y-4">
              <h3 className="font-semibold text-xs text-stone-800 uppercase tracking-wider">
                Hero Section Header & Visual
              </h3>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-700">Hero Main Banner Photo</label>
                <div className="flex items-center gap-5">
                  {settings.hero_image_url ? (
                    <div className="relative w-32 h-20 rounded-2xl overflow-hidden border border-stone-200 bg-sand-50">
                      <Image src={settings.hero_image_url} alt="Hero Banner" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleFieldChange('hero_image_url', null)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-20 rounded-2xl bg-sand-100 flex items-center justify-center text-[10px] text-stone-400 border border-dashed border-sand-300 text-center px-2">
                      Default Hero Image
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-sand-100 hover:bg-sand-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer border border-stone-300 transition-colors">
                      <Upload className="w-4 h-4 text-brand-700" />
                      <span>Upload Hero Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('hero_image_url', e)}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-stone-400">High-resolution horizontal photo of snacks / packs.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Hero Badge Line
                  </label>
                  <input
                    type="text"
                    value={settings.hero_badge || ''}
                    onChange={(e) => handleFieldChange('hero_badge', e.target.value)}
                    placeholder="e.g. Handcrafted Indian Packed Foods & Snacks"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Footer Description
                  </label>
                  <input
                    type="text"
                    value={settings.footer_text || ''}
                    onChange={(e) => handleFieldChange('footer_text', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUSINESS DETAILS */}
        {activeTab === 'business' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-5">
            <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Official Business Details & Regulatory Info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Proprietor Name
                </label>
                <input
                  type="text"
                  value={settings.proprietor}
                  onChange={(e) => handleFieldChange('proprietor', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={settings.contact_person}
                  onChange={(e) => handleFieldChange('contact_person', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={settings.whatsapp}
                  onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  FSSAI License Number
                </label>
                <input
                  type="text"
                  value={settings.fssai_license}
                  onChange={(e) => handleFieldChange('fssai_license', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={settings.opening_hours}
                  onChange={(e) => handleFieldChange('opening_hours', e.target.value)}
                  placeholder="8:00 AM to 8:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-stone-100">
              <h3 className="font-semibold text-xs text-stone-800 uppercase tracking-wider">
                Address Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={settings.address_line1}
                  onChange={(e) => handleFieldChange('address_line1', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (P.O. / P.S.)"
                  value={settings.address_line2}
                  onChange={(e) => handleFieldChange('address_line2', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
                <input
                  type="text"
                  placeholder="District"
                  value={settings.district}
                  onChange={(e) => handleFieldChange('district', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="State"
                    value={settings.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={settings.pincode}
                    onChange={(e) => handleFieldChange('pincode', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SOCIAL MEDIA */}
        {activeTab === 'social' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-5">
            <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Social Channels & Google Presence
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Instagram Handle / URL
                </label>
                <input
                  type="url"
                  value={settings.instagram_url}
                  onChange={(e) => handleFieldChange('instagram_url', e.target.value)}
                  placeholder="https://instagram.com/desifusionbite"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  value={settings.youtube_url}
                  onChange={(e) => handleFieldChange('youtube_url', e.target.value)}
                  placeholder="https://youtube.com/@desifusionbite"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Google Business Profile / Maps Link
                </label>
                <input
                  type="url"
                  value={settings.google_business_url || ''}
                  onChange={(e) => handleFieldChange('google_business_url', e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOMEPAGE SECTIONS */}
        {activeTab === 'sections' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-2">
              Homepage Sections Visibility
            </h2>
            <p className="text-xs text-stone-500">
              Enable or disable sections on the homepage.
            </p>

            <div className="divide-y divide-stone-100">
              {sections.map((sec) => (
                <div key={sec.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-stone-900">{sec.name}</div>
                    <div className="text-xs text-stone-500">{sec.title || 'Default Title'}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSection(sec.id, sec.is_enabled)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      sec.is_enabled
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {sec.is_enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ABOUT STORY */}
        {activeTab === 'story' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-5">
            <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Brand Story Narrative
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Story Title
              </label>
              <input
                type="text"
                value={settings.story_title || ''}
                onChange={(e) => handleFieldChange('story_title', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-700">About Story Image</label>
              <div className="flex items-center gap-5">
                {settings.about_image_url ? (
                  <div className="relative w-32 h-24 rounded-2xl overflow-hidden border border-stone-200 bg-sand-50">
                    <Image src={settings.about_image_url} alt="About Us" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleFieldChange('about_image_url', null)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-24 rounded-2xl bg-sand-100 flex items-center justify-center text-[10px] text-stone-400 border border-dashed border-sand-300 text-center px-2">
                    Default Story Image
                  </div>
                )}

                <div className="space-y-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-sand-100 hover:bg-sand-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer border border-stone-300 transition-colors">
                    <Upload className="w-4 h-4 text-brand-700" />
                    <span>Upload Story Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('about_image_url', e)}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-stone-400">Photo depicting kitchen craft, raw millets, or packaging.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Story Paragraphs (Separate each paragraph by a blank line)
              </label>
              <textarea
                rows={6}
                value={(settings.story_paragraphs || []).join('\n\n')}
                onChange={(e) => {
                  const paras = e.target.value.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
                  handleFieldChange('story_paragraphs', paras);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
              />
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Website Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
