'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  createEnquiry,
  updateWebsiteSettings,
  updateWebsiteSection,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  updateEnquiry,
  logAuditEvent,
  getEnquiries,
} from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { OdooService } from '@/lib/odoo';
import { generateSlug } from '@/lib/utils';
import { Enquiry, EnquiryType, WebsiteSettings } from '@/types/database';

// ----------------------------------------------------------------------
// 1. PUBLIC ENQUIRY SUBMISSION ACTION
// ----------------------------------------------------------------------
const EnquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  type: z.enum(['general', 'product', 'wholesale', 'distributor', 'retailer']),
  business_name: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  product_interest: z.string().optional(),
  estimated_quantity: z.string().optional(),
  message: z.string().min(3, 'Please provide a message or requirement'),
});

export async function submitEnquiryAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const rawData = {
      name: (formData.get('name') as string)?.trim(),
      phone: (formData.get('phone') as string)?.trim(),
      email: (formData.get('email') as string)?.trim() || '',
      whatsapp: (formData.get('whatsapp') as string)?.trim() || (formData.get('phone') as string)?.trim(),
      type: (formData.get('type') as EnquiryType) || 'general',
      business_name: (formData.get('business_name') as string)?.trim() || undefined,
      city: (formData.get('city') as string)?.trim() || undefined,
      state: (formData.get('state') as string)?.trim() || undefined,
      product_interest: (formData.get('product_interest') as string)?.trim() || undefined,
      estimated_quantity: (formData.get('estimated_quantity') as string)?.trim() || undefined,
      message: (formData.get('message') as string)?.trim(),
    };

    const validated = EnquirySchema.safeParse(rawData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || 'Invalid form data' };
    }

    const res = await createEnquiry({
      name: validated.data.name,
      phone: validated.data.phone,
      email: validated.data.email || null,
      whatsapp: validated.data.whatsapp || null,
      type: validated.data.type,
      business_name: validated.data.business_name || null,
      city: validated.data.city || null,
      state: validated.data.state || null,
      product_interest: validated.data.product_interest || null,
      estimated_quantity: validated.data.estimated_quantity || null,
      message: validated.data.message,
    });

    if (!res.success || !res.data) {
      return { success: false, error: res.error || 'Could not submit enquiry. Please try again or WhatsApp us directly.' };
    }

    // Await Odoo CRM synchronization cleanly within a timeout guard (serverless-safe)
    try {
      const odooRes = await Promise.race([
        OdooService.syncEnquiryToCRM(res.data),
        new Promise<{ success: boolean; leadId?: string; error: string }>((resolve) =>
          setTimeout(() => resolve({ success: false, error: 'Odoo sync timeout' }), 2500)
        ),
      ]);

      if (odooRes.success && odooRes.leadId) {
        await updateEnquiry(res.data.id, {
          odoo_lead_id: odooRes.leadId,
          odoo_sync_status: 'synced',
        });
      }
    } catch {
      // Safe resilience: failure does not interrupt response to the public user
    }

    revalidatePath('/admin/enquiries');
    return {
      success: true,
      message: 'Thank you! Your enquiry has been received. Our team will contact you shortly.',
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Submission failed. Please reach us directly on WhatsApp.',
    };
  }
}

// ----------------------------------------------------------------------
// 2. ADMIN WEBSITE SETTINGS ACTIONS (OWNER / ADMIN ONLY)
// ----------------------------------------------------------------------
export async function updateWebsiteSettingsAction(
  updates: Partial<WebsiteSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await requireRole(['owner', 'admin']);

    const res = await updateWebsiteSettings(updates);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    await logAuditEvent(
      'update_settings',
      'website_settings',
      'current',
      updates as Record<string, unknown>,
      profile.email
    );

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
  }
}

export async function toggleSectionAction(
  sectionId: string,
  isEnabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await requireRole(['owner', 'admin']);

    const res = await updateWebsiteSection(sectionId, { is_enabled: isEnabled });
    if (!res.success) return { success: false, error: res.error };

    await logAuditEvent(
      'toggle_section',
      'website_sections',
      sectionId,
      { is_enabled: isEnabled },
      profile.email
    );
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Toggle failed' };
  }
}

// ----------------------------------------------------------------------
// 3. ADMIN PRODUCT MANAGEMENT ACTIONS (OWNER / ADMIN ONLY)
// ----------------------------------------------------------------------
export async function saveProductAction(
  productId: string | null,
  productPayload: Record<string, unknown>,
  variantsPayload?: Array<Record<string, unknown>>
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    const profile = await requireRole(['owner', 'admin']);

    const name = String(productPayload.name || '').trim();
    if (!name) {
      return { success: false, error: 'Product name is required' };
    }

    const slug = String(productPayload.slug || generateSlug(name)).trim();

    const formattedProduct = {
      name,
      slug,
      sku: productPayload.sku ? String(productPayload.sku).trim() : null,
      category_id: productPayload.category_id ? String(productPayload.category_id) : null,
      millet_type: productPayload.millet_type ? String(productPayload.millet_type).trim() : null,
      flavour: productPayload.flavour ? String(productPayload.flavour).trim() : null,
      short_description: productPayload.short_description ? String(productPayload.short_description).trim() : null,
      full_description: productPayload.full_description ? String(productPayload.full_description).trim() : null,
      ingredients: productPayload.ingredients ? String(productPayload.ingredients).trim() : null,
      allergens: productPayload.allergens ? String(productPayload.allergens).trim() : null,
      nutritional_info: (productPayload.nutritional_info as any) || null,
      weight: productPayload.weight ? String(productPayload.weight).trim() : null,
      pack_size: productPayload.pack_size ? String(productPayload.pack_size).trim() : null,
      mrp: productPayload.mrp ? Number(productPayload.mrp) : null,
      selling_price: productPayload.selling_price ? Number(productPayload.selling_price) : null,
      wholesale_price: productPayload.wholesale_price ? Number(productPayload.wholesale_price) : null,
      moq: productPayload.moq ? Number(productPayload.moq) : 1,
      availability: (productPayload.availability as 'in_stock' | 'low_stock' | 'out_of_stock') || 'in_stock',
      is_featured: Boolean(productPayload.is_featured),
      is_published: Boolean(productPayload.is_published),
      primary_image_url: productPayload.primary_image_url ? String(productPayload.primary_image_url) : null,
      gallery_images: Array.isArray(productPayload.gallery_images) ? (productPayload.gallery_images as string[]) : [],
      odoo_product_id: productPayload.odoo_product_id ? String(productPayload.odoo_product_id).trim() : null,
      seo_title: productPayload.seo_title ? String(productPayload.seo_title).trim() : null,
      seo_description: productPayload.seo_description ? String(productPayload.seo_description).trim() : null,
      display_order: Number(productPayload.display_order) || 0,
    };

    let result;
    if (productId) {
      result = await updateProduct(productId, formattedProduct, variantsPayload as any);
      await logAuditEvent('update_product', 'products', productId, formattedProduct, profile.email);
    } else {
      result = await createProduct(formattedProduct as any, variantsPayload as any);
      if (result.success && result.data) {
        await logAuditEvent('create_product', 'products', result.data.id, formattedProduct, profile.email);
      }
    }

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/', 'layout');
    revalidatePath('/products');
    revalidatePath(`/products/${slug}`);
    revalidatePath('/admin/products');

    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save product' };
  }
}

export async function deleteProductAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await requireRole(['owner', 'admin']);

    const res = await deleteProduct(productId);
    if (!res.success) return { success: false, error: res.error };

    await logAuditEvent('delete_product', 'products', productId, {}, profile.email);
    revalidatePath('/', 'layout');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
  }
}

// ----------------------------------------------------------------------
// 4. ADMIN CATEGORY MANAGEMENT ACTIONS (OWNER / ADMIN ONLY)
// ----------------------------------------------------------------------
export async function saveCategoryAction(
  categoryId: string | null,
  payload: { name: string; slug?: string; description?: string; image_url?: string; is_published?: boolean }
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    const profile = await requireRole(['owner', 'admin']);

    const name = payload.name.trim();
    if (!name) return { success: false, error: 'Category name is required' };
    const slug = payload.slug ? generateSlug(payload.slug) : generateSlug(name);

    const categoryData = {
      name,
      slug,
      description: payload.description || null,
      image_url: payload.image_url || null,
      display_order: 0,
      is_published: payload.is_published !== undefined ? payload.is_published : true,
    };

    let res;
    if (categoryId) {
      res = await updateCategory(categoryId, categoryData);
      await logAuditEvent('update_category', 'categories', categoryId, categoryData, profile.email);
    } else {
      res = await createCategory(categoryData);
      if (res.success && res.data) {
        await logAuditEvent('create_category', 'categories', res.data.id, categoryData, profile.email);
      }
    }

    if (!res.success) return { success: false, error: res.error };

    revalidatePath('/', 'layout');
    revalidatePath('/products');
    revalidatePath('/admin/categories');
    return { success: true, data: res.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Category save error' };
  }
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await requireRole(['owner', 'admin']);

    const res = await deleteCategory(categoryId);
    if (!res.success) return { success: false, error: res.error };

    await logAuditEvent('delete_category', 'categories', categoryId, {}, profile.email);
    revalidatePath('/', 'layout');
    revalidatePath('/products');
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Category delete error' };
  }
}

// ----------------------------------------------------------------------
// 5. ENQUIRY STATUS & ODOO ACTIONS (OWNER / ADMIN / STAFF)
// ----------------------------------------------------------------------
export async function updateEnquiryStatusAction(
  enquiryId: string,
  status: Enquiry['status'],
  internalNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await requireRole(['owner', 'admin', 'staff']);

    const res = await updateEnquiry(enquiryId, {
      status,
      internal_notes: internalNotes !== undefined ? internalNotes : undefined,
    });
    if (!res.success) return { success: false, error: res.error };

    await logAuditEvent('update_enquiry_status', 'enquiries', enquiryId, { status, internalNotes }, profile.email);
    revalidatePath('/admin/enquiries');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Status update error' };
  }
}

export async function syncEnquiryWithOdooAction(
  enquiryId: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const profile = await requireRole(['owner', 'admin']);

    const enquiries = await getEnquiries();
    const target = enquiries.find((e) => e.id === enquiryId);
    if (!target) return { success: false, error: 'Enquiry not found' };

    const syncRes = await OdooService.syncEnquiryToCRM(target);
    if (syncRes.success && syncRes.leadId) {
      await updateEnquiry(enquiryId, {
        odoo_lead_id: syncRes.leadId,
        odoo_sync_status: 'synced',
      });
      await logAuditEvent('sync_odoo_crm', 'enquiries', enquiryId, { lead_id: syncRes.leadId }, profile.email);
      revalidatePath('/admin/enquiries');
      return { success: true, message: `Synced to Odoo CRM (Lead ID: ${syncRes.leadId})` };
    } else {
      await updateEnquiry(enquiryId, {
        odoo_sync_status: 'failed',
      });
      revalidatePath('/admin/enquiries');
      return { success: false, error: syncRes.error || 'Odoo sync failed' };
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Odoo sync failure' };
  }
}
