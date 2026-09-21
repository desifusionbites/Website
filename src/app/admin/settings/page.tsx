import React from 'react';
import { getOdooConfig } from '@/lib/odoo';
import { Server, Truck, Users, CheckCircle2, Lock } from 'lucide-react';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const odooConfig = getOdooConfig();

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          System & Business Integrations
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Review business ERP integration, shipping architecture, and role-based access control.
        </p>
      </div>

      {/* 1. Odoo ERP Integration Status */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-stone-900">
                Odoo Business ERP Integration Layer
              </h2>
              <p className="text-xs text-stone-500">
                CRM Lead Synchronization & Inventory Availability Service
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 ${
              odooConfig.enabled
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            {odooConfig.enabled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </>
            ) : (
              <span>Disabled / Standby</span>
            )}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 space-y-2 text-xs text-stone-700">
          <div className="flex items-center gap-2 text-stone-900 font-semibold">
            <Lock className="w-4 h-4 text-brand-700" />
            <span>Security Rule: Server-Side Secrets Only</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            In compliance with security standards, all Odoo connection secrets (<code>ODOO_URL</code>, <code>ODOO_DB</code>, <code>ODOO_USERNAME</code>, <code>ODOO_API_KEY</code>) are managed securely via server environment variables, never stored as plain CMS records.
          </p>
          <p className="text-stone-600 leading-relaxed">
            <strong>Fail-Safe Architecture:</strong> If Odoo is offline or undergoing maintenance, website customer enquiries are safely stored in Supabase with a retry queue, ensuring zero disruption to public visitors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-400 block text-[11px]">Configured Server Host:</span>
            <span className="font-mono text-stone-800">{odooConfig.url || 'Not set in .env'}</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-stone-400 block text-[11px]">Database Name:</span>
            <span className="font-mono text-stone-800">{odooConfig.db || 'Not set in .env'}</span>
          </div>
        </div>
      </div>

      {/* 2. Shipping Provider Layer */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-stone-900">
                Shipping & Logistics Architecture
              </h2>
              <p className="text-xs text-stone-500">
                Provider-Agnostic Logistics Integration Layer
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-brand-100 text-brand-800">
            {process.env.SHIPPING_PROVIDER?.toLowerCase() === 'shiprocket' || process.env.SHIPROCKET_ENABLED === 'true'
              ? 'Shiprocket Partner API Active'
              : 'Manual Courier Partner Mode'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 text-xs text-stone-600 space-y-2 leading-relaxed">
          <p>
            Desi Fusion Bites utilizes a provider-independent <code>ShippingProvider</code> interface.
          </p>
          <p>
            Currently running on the <strong>{process.env.SHIPPING_PROVIDER?.toLowerCase() === 'shiprocket' ? 'ShiprocketProvider' : 'ManualShippingProvider'}</strong> adapter. When shipping orders in the Admin Orders panel, tracking numbers, labels, and dispatch notifications are generated seamlessly.
          </p>
        </div>
      </div>

      {/* 3. Team Roles & Access Control */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-stone-900">
              Role-Based Access Control (RBAC)
            </h2>
            <p className="text-xs text-stone-500">
              Database-enforced permission tiers via Supabase Row-Level Security
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-sand-50 rounded-xl border border-sand-200 space-y-1">
            <span className="font-bold text-brand-800 uppercase text-[11px] block">OWNER</span>
            <p className="text-stone-600">Full control over all website settings, branding, products, team roles, and system configuration.</p>
          </div>

          <div className="p-4 bg-sand-50 rounded-xl border border-sand-200 space-y-1">
            <span className="font-bold text-stone-800 uppercase text-[11px] block">ADMIN</span>
            <p className="text-stone-600">Manages products, categories, pricing, customer enquiries, promotions, and testimonials.</p>
          </div>

          <div className="p-4 bg-sand-50 rounded-xl border border-sand-200 space-y-1">
            <span className="font-bold text-stone-800 uppercase text-[11px] block">STAFF</span>
            <p className="text-stone-600">View products and manage enquiry responses and pipeline notes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
