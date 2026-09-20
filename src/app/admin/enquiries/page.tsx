import React from 'react';
import { getEnquiries } from '@/lib/db';
import { EnquiryManager } from '@/components/admin/EnquiryManager';

export const revalidate = 0;

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Enquiries & Wholesale CRM
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage customer enquiries, wholesale requests, distributor leads, internal notes, and Odoo CRM sync.
        </p>
      </div>

      <EnquiryManager initialEnquiries={enquiries} />
    </div>
  );
}
