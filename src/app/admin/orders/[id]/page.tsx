import React from 'react';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { getOrderById } from '@/lib/db';
import { AdminOrderDetails } from '@/components/admin/AdminOrderDetails';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(['owner', 'admin', 'staff']);
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return <AdminOrderDetails order={order} />;
}
