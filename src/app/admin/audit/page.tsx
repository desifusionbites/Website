import React from 'react';
import { getAuditLogs } from '@/lib/db';
import { History, Shield } from 'lucide-react';

export const revalidate = 0;

export default async function AdminAuditPage() {
  const logs = await getAuditLogs(100);

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Admin Audit Trail
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Complete log of all administrative actions, product modifications, settings updates, and status changes.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 uppercase font-semibold text-stone-500 text-[11px]">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-5 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="px-5 py-3 text-stone-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-stone-900 font-sans font-semibold">
                      {log.user_email || 'system'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-800">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {log.entity_type}
                    </td>
                    <td className="px-5 py-3 text-stone-500 truncate max-w-xs font-sans text-xs">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-stone-400 space-y-2">
            <History className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-xs">No audit logs recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
