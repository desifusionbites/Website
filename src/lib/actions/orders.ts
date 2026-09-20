'use server';

import { requireRole } from '@/lib/auth';
import { updateOrderAdmin } from '@/lib/db';
import { OrderStatus } from '@/types/database';

export async function updateOrderAdminAction(
  orderId: string,
  updateData: {
    status?: OrderStatus;
    shipping_status?: string;
    internal_notes?: string;
  }
) {
  await requireRole(['owner', 'admin']);
  return await updateOrderAdmin(orderId, updateData);
}
