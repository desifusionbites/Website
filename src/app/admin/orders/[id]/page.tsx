import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { getOrderById } from '@/lib/db';
import { AdminOrderDetails } from '@/components/admin/AdminOrderDetails';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile || !['owner', 'admin', 'staff'].includes(profile.role)) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return <AdminOrderDetails order={order} />;
}
