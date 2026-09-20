'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Enquiry, EnquiryStatus } from '@/types/database';
import { updateEnquiryStatusAction, syncEnquiryWithOdooAction } from '@/lib/actions';
import {
  Inbox,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';

interface EnquiryManagerProps {
  initialEnquiries: Enquiry[];
}

export function EnquiryManager({ initialEnquiries }: EnquiryManagerProps) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<EnquiryStatus>('new');
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filteredEnquiries = enquiries.filter((e) => {
    if (filterType !== 'all' && e.type !== filterType) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    return true;
  });

  function openEnquiry(enq: Enquiry) {
    setSelectedEnquiry(enq);
    setStatus(enq.status);
    setNotes(enq.internal_notes || '');
    setMessage(null);
  }

  async function handleSaveStatus() {
    if (!selectedEnquiry) return;
    setLoading(true);
    const res = await updateEnquiryStatusAction(selectedEnquiry.id, status, notes);
    setLoading(false);

    if (res.success) {
      setMessage('Enquiry status and notes updated.');
      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === selectedEnquiry.id ? { ...e, status, internal_notes: notes } : e
        )
      );
      router.refresh();
    }
  }

  async function handleOdooSync(enquiryId: string) {
    setSyncLoading(true);
    const res = await syncEnquiryWithOdooAction(enquiryId);
    setSyncLoading(false);

    if (res.success) {
      setMessage(res.message || 'Synced to Odoo CRM');
      router.refresh();
    } else {
      setMessage(`Odoo Sync: ${res.error}`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-stone-500">Filter Type:</span>
          {['all', 'general', 'product', 'wholesale', 'distributor', 'retailer'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                filterType === t
                  ? 'bg-brand-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="contacted">Contacted</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Enquiries List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          {filteredEnquiries.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {filteredEnquiries.map((enq) => {
                const isSelected = selectedEnquiry?.id === enq.id;
                return (
                  <div
                    key={enq.id}
                    onClick={() => openEnquiry(enq)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand-50/70 border-l-4 border-brand-700' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{enq.name}</span>
                          <span className="bg-sand-100 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
                            {enq.type}
                          </span>
                        </div>
                        {enq.business_name && (
                          <div className="text-xs font-semibold text-brand-800">
                            {enq.business_name}
                          </div>
                        )}
                        <div className="text-xs text-stone-500 mt-1 line-clamp-2">
                          {enq.message}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            enq.status === 'new'
                              ? 'bg-red-100 text-red-700'
                              : enq.status === 'contacted'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {enq.status}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(enq.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-stone-400 space-y-2">
              <Inbox className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-xs">No enquiries match the selected filters.</p>
            </div>
          )}
        </div>

        {/* Selected Enquiry Details & CRM Actions */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          {selectedEnquiry ? (
            <div className="space-y-5">
              <div className="border-b border-stone-100 pb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {selectedEnquiry.name}
                  </h3>
                  <div className="text-xs text-stone-500 font-medium uppercase tracking-wider">
                    {selectedEnquiry.type} Enquiry
                  </div>
                </div>
                <span className="text-[10px] text-stone-400">
                  {new Date(selectedEnquiry.created_at).toLocaleString()}
                </span>
              </div>

              {message && (
                <div className="p-3 bg-brand-50 border border-brand-200 text-brand-900 text-xs rounded-xl font-medium">
                  {message}
                </div>
              )}

              {/* Direct Info */}
              <div className="space-y-2.5 text-xs text-stone-700 bg-sand-50 p-4 rounded-xl border border-sand-200">
                {selectedEnquiry.business_name && (
                  <div><strong>Business Name:</strong> {selectedEnquiry.business_name}</div>
                )}
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>+91 {selectedEnquiry.phone}</span>
                </div>
                {selectedEnquiry.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{selectedEnquiry.email}</span>
                  </div>
                )}
                {(selectedEnquiry.city || selectedEnquiry.state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{selectedEnquiry.city}, {selectedEnquiry.state}</span>
                  </div>
                )}
                {selectedEnquiry.product_interest && (
                  <div><strong>Interested In:</strong> {selectedEnquiry.product_interest}</div>
                )}
                {selectedEnquiry.estimated_quantity && (
                  <div><strong>Order Volume:</strong> {selectedEnquiry.estimated_quantity}</div>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Submitted Message:
                </label>
                <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-800 leading-relaxed whitespace-pre-line border border-stone-200">
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Quick Communication Triggers */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/91${selectedEnquiry.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(selectedEnquiry.name)},%20thank%20you%20for%20contacting%20Desi%20Fusion%20Bites.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reply on WhatsApp</span>
                </a>

                <a
                  href={`tel:${selectedEnquiry.phone}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Phone</span>
                </a>
              </div>

              {/* Status Update & Internal Notes */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Update Pipeline Status:
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium"
                  >
                    <option value="new">New (Unprocessed)</option>
                    <option value="read">Read</option>
                    <option value="contacted">Contacted / Replied</option>
                    <option value="pending">Pending Follow-up</option>
                    <option value="completed">Completed / Deal Won</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Internal CRM Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add internal notes about discussions, quotes, pricing offered..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSaveStatus}
                    className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Status & Notes'}
                  </button>

                  <button
                    type="button"
                    disabled={syncLoading}
                    onClick={() => handleOdooSync(selectedEnquiry.id)}
                    title="Sync this lead into Odoo CRM"
                    className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                    <span>Sync Odoo</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-stone-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-xs">Select an enquiry from the list to view details and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
