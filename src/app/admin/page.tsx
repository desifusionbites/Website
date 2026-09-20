import React from 'react';
import Link from 'next/link';
import {
  getProducts,
  getCategories,
  getEnquiries,
  getAuditLogs,
  getWebsiteSettings,
} from '@/lib/db';
import { getOdooConfig } from '@/lib/odoo';
import {
  Package,
  Layers,
  Inbox,
  ArrowUpRight,
  PlusCircle,
  FileEdit,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [products, categories, enquiries, auditLogs, settings] = await Promise.all([
    getProducts({ includeUnpublished: true }),
    getCategories(true),
    getEnquiries({ limit: 10 }),
    getAuditLogs(5),
    getWebsiteSettings(),
  ]);

  const odooConfig = getOdooConfig();

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.is_published).length;
  const draftProducts = totalProducts - publishedProducts;

  const totalEnquiries = enquiries.length;
  const unreadEnquiries = enquiries.filter((e) => e.status === 'new').length;
  const wholesaleEnquiries = enquiries.filter(
    (e) => e.type === 'wholesale' || e.type === 'distributor' || e.type === 'retailer'
  ).length;

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Welcome to Desi Fusion Bites Admin
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage your website, products, branding, and customer enquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs shadow-md transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-semibold text-xs shadow-xs transition-colors"
          >
            <FileEdit className="w-4 h-4" />
            <span>Edit Branding</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Products KPI */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Products
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{totalProducts}</span>
            <span className="text-xs text-stone-500">total</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-600 pt-2 border-t border-stone-100">
            <span className="text-emerald-700 font-semibold">{publishedProducts} Published</span>
            <span>•</span>
            <span className="text-amber-700 font-semibold">{draftProducts} Drafts</span>
          </div>
        </div>

        {/* Categories KPI */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Categories
            </span>
            <div className="w-8 h-8 rounded-lg bg-sand-200 text-stone-800 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{categories.length}</span>
            <span className="text-xs text-stone-500">active</span>
          </div>
          <div className="text-xs text-stone-500 pt-2 border-t border-stone-100">
            <Link href="/admin/categories" className="text-brand-700 hover:underline font-semibold">
              Manage Categories →
            </Link>
          </div>
        </div>

        {/* Enquiries KPI */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Customer Enquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{totalEnquiries}</span>
            {unreadEnquiries > 0 && (
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadEnquiries} NEW
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
            <span>{wholesaleEnquiries} Wholesale Leads</span>
          </div>
        </div>

        {/* Odoo ERP & Integrations KPI */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Odoo ERP Health
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${odooConfig.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {odooConfig.enabled ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Server Standby
              </span>
            )}
          </div>
          <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100">
            Resilient sync queue active
          </div>
        </div>
      </div>

      {/* Main Split: Recent Enquiries & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Enquiries */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Recent Website & Wholesale Enquiries
            </h2>
            <Link
              href="/admin/enquiries"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enquiries.length > 0 ? (
            <div className="divide-y divide-stone-100 overflow-x-auto">
              {enquiries.slice(0, 5).map((enq) => (
                <div key={enq.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{enq.name}</span>
                      {enq.business_name && (
                        <span className="text-stone-500">({enq.business_name})</span>
                      )}
                      <span className="bg-sand-100 text-stone-700 px-2 py-0.5 rounded text-[10px] uppercase font-semibold">
                        {enq.type}
                      </span>
                    </div>
                    <p className="text-stone-600 line-clamp-1">{enq.message}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        enq.status === 'new'
                          ? 'bg-red-100 text-red-700'
                          : enq.status === 'contacted'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {enq.status}
                    </span>
                    <a
                      href={`https://wa.me/91${enq.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-medium"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 py-6 text-center">No enquiries received yet.</p>
          )}
        </div>

        {/* Right: Quick Settings Summary & Audit */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
              Brand Profile Snapshot
            </h3>
            <div className="space-y-2 text-xs text-stone-700">
              <div><strong>Brand:</strong> {settings.brand_name}</div>
              <div><strong>Tagline:</strong> {settings.tagline}</div>
              <div><strong>Proprietor:</strong> {settings.proprietor}</div>
              <div><strong>Contact:</strong> {settings.contact_person} ({settings.phone})</div>
              <div><strong>FSSAI:</strong> {settings.fssai_license}</div>
            </div>
            <Link
              href="/admin/content"
              className="block text-center py-2 bg-sand-100 hover:bg-sand-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
            >
              Edit Details in CMS
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-3">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
              Recent CMS Actions
            </h3>
            {auditLogs.length > 0 ? (
              <div className="space-y-2.5 text-xs text-stone-600">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-stone-900">{log.action}</span> on {log.entity_type}
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400">No recent audit records.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
