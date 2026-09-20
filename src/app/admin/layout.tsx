import React from 'react';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Inbox,
  FileEdit,
  Star,
  HelpCircle,
  Megaphone,
  History,
  Settings,
  ExternalLink,
  LogOut,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders & Sales', icon: ShoppingBag },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: Layers },
    { href: '/admin/enquiries', label: 'Enquiries & CRM', icon: Inbox },
    { href: '/admin/content', label: 'Website Content', icon: FileEdit },
    { href: '/admin/promotions', label: 'Promotions', icon: Megaphone },
    { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
    { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
    { href: '/admin/audit', label: 'Audit Logs', icon: History },
    { href: '/admin/settings', label: 'Settings & Integrations', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0 border-r border-stone-800">
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-spice-700 text-white flex items-center justify-center font-serif font-bold text-base shadow">
              DFB
            </div>
            <div>
              <div className="font-serif font-bold text-white text-base leading-none">
                Admin CMS
              </div>
              <div className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase mt-0.5">
                Desi Fusion Bites
              </div>
            </div>
          </Link>
        </div>

        {/* User Role Badge */}
        {profile && (
          <div className="px-5 py-3 bg-stone-800/60 border-b border-stone-800 flex items-center justify-between text-xs">
            <div className="truncate max-w-[130px] text-stone-300">
              {profile.email}
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/20 text-brand-400 border border-brand-500/30">
              {profile.role}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <Icon className="w-4 h-4 text-stone-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Sidebar Action */}
        <div className="p-3 border-t border-stone-800 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-400 hover:bg-stone-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>View Public Website</span>
            </span>
          </Link>
          <Link
            href="/admin/login"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch / Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
