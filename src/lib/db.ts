import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { INITIAL_BUSINESS_SETTINGS, INITIAL_SECTIONS } from '@/lib/constants';
import {
  WebsiteSettings,
  WebsiteSection,
  Category,
  Product,
  ProductVariant,
  Testimonial,
  FAQ,
  Promotion,
  Enquiry,
  AuditLog,
  Order,
  OrderItem,
  Shipment,
  OrderStatus,
} from '@/types/database';

// ----------------------------------------------------------------------
// 1. WEBSITE SETTINGS
// ----------------------------------------------------------------------
export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('website_settings')
      .select('*')
      .eq('id', 'current')
      .maybeSingle();

    if (error || !data) {
      return INITIAL_BUSINESS_SETTINGS;
    }
    return data as WebsiteSettings;
  } catch {
    return INITIAL_BUSINESS_SETTINGS;
  }
}

export async function updateWebsiteSettings(
  settings: Partial<WebsiteSettings>
): Promise<{ success: boolean; data?: WebsiteSettings; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { data, error } = await supabase
      .from('website_settings')
      .upsert({ ...settings, id: 'current', updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      try {
        const adminClient = createAdminClient();
        const adminRes = await adminClient
          .from('website_settings')
          .upsert({ ...settings, id: 'current', updated_at: new Date().toISOString() })
          .select()
          .single();
        if (adminRes.data) {
          data = adminRes.data;
          error = null;
        }
      } catch {}
    }

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as WebsiteSettings };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update website settings in database',
    };
  }
}

// ----------------------------------------------------------------------
// 2. WEBSITE SECTIONS
// ----------------------------------------------------------------------
export async function getWebsiteSections(): Promise<WebsiteSection[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('website_sections')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return INITIAL_SECTIONS;
    }
    return data as WebsiteSection[];
  } catch {
    return INITIAL_SECTIONS;
  }
}

export async function updateWebsiteSection(
  id: string,
  updates: Partial<WebsiteSection>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { error } = await supabase
      .from('website_sections')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      try {
        const adminClient = createAdminClient();
        const adminRes = await adminClient
          .from('website_sections')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);
        error = adminRes.error;
      } catch {}
    }

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

// ----------------------------------------------------------------------
// 3. CATEGORIES
// ----------------------------------------------------------------------
export async function getCategories(includeUnpublished = false): Promise<Category[]> {
  try {
    const supabase = await createServerSupabase();
    let query = supabase.from('categories').select('*').order('display_order', { ascending: true });

    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as Category[];
  } catch {
    return [];
  }
}

export async function createCategory(
  category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      try {
        const adminClient = createAdminClient();
        const adminRes = await adminClient
          .from('categories')
          .insert([category])
          .select()
          .single();
        if (adminRes.data) {
          data = adminRes.data;
          error = null;
        }
      } catch {}
    }

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Category };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create category' };
  }
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      try {
        const adminClient = createAdminClient();
        const adminRes = await adminClient
          .from('categories')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (adminRes.data) {
          data = adminRes.data;
          error = null;
        }
      } catch {}
    }

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Category };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update category' };
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      try {
        const adminClient = createAdminClient();
        const adminRes = await adminClient.from('categories').delete().eq('id', id);
        error = adminRes.error;
      } catch {}
    }
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete category' };
  }
}

// ----------------------------------------------------------------------
// 4. PRODUCTS & VARIANTS
// ----------------------------------------------------------------------
export async function getProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  featuredOnly?: boolean;
  search?: string;
  includeUnpublished?: boolean;
}): Promise<Product[]> {
  try {
    const supabase = await createServerSupabase();
    let query = supabase
      .from('products')
      .select('*, category:categories(*), variants:product_variants(*)')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!options?.includeUnpublished) {
      query = query.eq('is_published', true);
    }
    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }
    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,flavour.ilike.%${options.search}%,millet_type.ilike.%${options.search}%`);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as Product[];
  } catch {
    return [];
  }
}

export async function getProductBySlug(
  slug: string,
  includeUnpublished = false
): Promise<Product | null> {
  try {
    const supabase = await createServerSupabase();
    let query = supabase
      .from('products')
      .select('*, category:categories(*), variants:product_variants(*)')
      .eq('slug', slug);

    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query.maybeSingle();
    if (error || !data) return null;
    return data as Product;
  } catch {
    return null;
  }
}

export async function createProduct(
  productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category' | 'variants'>,
  variants?: Array<Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    const sanitizedData = { ...productData };
    if (!sanitizedData.category_id || sanitizedData.category_id === '' || sanitizedData.category_id === 'undefined') {
      sanitizedData.category_id = null;
    }

    const supabase = await createServerSupabase();
    let { data: newProduct, error: prodError } = await supabase
      .from('products')
      .insert([sanitizedData])
      .select()
      .single();

    // Fallback to admin client if RLS restricts
    if (prodError) {
      try {
        const adminClient = createAdminClient();
        const adminRes = await adminClient
          .from('products')
          .insert([sanitizedData])
          .select()
          .single();
        if (adminRes.data) {
          newProduct = adminRes.data;
          prodError = null;
        }
      } catch {}
    }

    if (prodError || !newProduct) {
      return { success: false, error: prodError?.message || 'Failed to insert product' };
    }

    if (variants && variants.length > 0) {
      const variantPayload = variants.map((v) => ({
        ...v,
        product_id: newProduct.id,
      }));
      const { error: varError } = await supabase.from('product_variants').insert(variantPayload);
      if (varError) {
        try {
          const adminClient = createAdminClient();
          await adminClient.from('product_variants').insert(variantPayload);
        } catch {}
      }
    }

    return { success: true, data: newProduct as Product };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function updateProduct(
  id: string,
  productData: Partial<Product>,
  variants?: Array<Partial<ProductVariant> & { id?: string }>
): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    const cleanedProductData = { ...(productData as Record<string, unknown>) };
    delete cleanedProductData.category;
    delete cleanedProductData.variants;

    if (!cleanedProductData.category_id || cleanedProductData.category_id === '' || cleanedProductData.category_id === 'undefined') {
      cleanedProductData.category_id = null;
    }

    let { data: updatedProduct, error: prodError } = await supabase
      .from('products')
      .update(cleanedProductData)
      .eq('id', id)
      .select()
      .single();

    // Fallback to admin client if RLS restricts
    if (prodError) {
      try {
        const adminClient = createAdminClient();
        const adminRes = await adminClient
          .from('products')
          .update(cleanedProductData)
          .eq('id', id)
          .select()
          .single();
        if (adminRes.data) {
          updatedProduct = adminRes.data;
          prodError = null;
        }
      } catch {}
    }

    if (prodError) {
      return { success: false, error: prodError.message };
    }

    if (variants !== undefined) {
      // Delete old variants and re-insert for consistency
      await supabase.from('product_variants').delete().eq('product_id', id);
      if (variants.length > 0) {
        const variantPayload = variants.map((v) => ({
          title: v.title || 'Standard Pack',
          millet_type: v.millet_type || null,
          flavour: v.flavour || null,
          pack_size: v.pack_size || null,
          sku: v.sku || null,
          mrp: v.mrp || null,
          selling_price: v.selling_price || null,
          wholesale_price: v.wholesale_price || null,
          stock_status: v.stock_status || 'in_stock',
          is_active: v.is_active !== undefined ? v.is_active : true,
          product_id: id,
        }));
        await supabase.from('product_variants').insert(variantPayload);
      }
    }

    return { success: true, data: updatedProduct as Product };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      try {
        const adminClient = createAdminClient();
        const adminRes = await adminClient.from('products').delete().eq('id', id);
        error = adminRes.error;
      } catch {}
    }
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete product' };
  }
}

// ----------------------------------------------------------------------
// 5. ENQUIRIES
// ----------------------------------------------------------------------
export async function createEnquiry(
  enquiryData: Omit<Enquiry, 'id' | 'created_at' | 'updated_at' | 'status' | 'odoo_lead_id' | 'odoo_sync_status' | 'internal_notes'>
): Promise<{ success: boolean; data?: Enquiry; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('enquiries')
      .insert([{ ...enquiryData, status: 'new', odoo_sync_status: 'not_synced' }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Enquiry };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit enquiry' };
  }
}

export async function getEnquiries(options?: {
  type?: string;
  status?: string;
  limit?: number;
}): Promise<Enquiry[]> {
  try {
    const supabase = await createServerSupabase();
    let query = supabase.from('enquiries').select('*').order('created_at', { ascending: false });

    if (options?.type && options.type !== 'all') {
      query = query.eq('type', options.type);
    }
    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as Enquiry[];
  } catch {
    return [];
  }
}

export async function updateEnquiry(
  id: string,
  updates: Partial<Enquiry>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from('enquiries').update(updates).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

// ----------------------------------------------------------------------
// 6. TESTIMONIALS & FAQS & PROMOTIONS
// ----------------------------------------------------------------------
export async function getTestimonials(includeUnpublished = false): Promise<Testimonial[]> {
  try {
    const supabase = await createServerSupabase();
    let query = supabase.from('testimonials').select('*').order('display_order', { ascending: true });
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data as Testimonial[];
  } catch {
    return [];
  }
}

export async function createTestimonial(
  testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: Testimonial; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { data, error } = await supabase.from('testimonials').insert([testimonial]).select().single();
    if (error) {
      try {
        const adminClient = createAdminClient();
        const res = await adminClient.from('testimonials').insert([testimonial]).select().single();
        if (res.data) { data = res.data; error = null; }
      } catch {}
    }
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Testimonial };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error' };
  }
}

export async function updateTestimonial(
  id: string,
  updates: Partial<Testimonial>
): Promise<{ success: boolean; data?: Testimonial; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { data, error } = await supabase.from('testimonials').update(updates).eq('id', id).select().single();
    if (error) {
      try {
        const adminClient = createAdminClient();
        const res = await adminClient.from('testimonials').update(updates).eq('id', id).select().single();
        if (res.data) { data = res.data; error = null; }
      } catch {}
    }
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Testimonial };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error' };
  }
}

export async function deleteTestimonial(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) {
      try {
        const adminClient = createAdminClient();
        const res = await adminClient.from('testimonials').delete().eq('id', id);
        error = res.error;
      } catch {}
    }
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error' };
  }
}

export async function getFAQs(includeUnpublished = false): Promise<FAQ[]> {
  try {
    const supabase = await createServerSupabase();
    let query = supabase.from('faqs').select('*').order('display_order', { ascending: true });
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data as FAQ[];
  } catch {
    return [];
  }
}

export async function createFAQ(
  faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: FAQ; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { data, error } = await supabase.from('faqs').insert([faq]).select().single();
    if (error) {
      try {
        const adminClient = createAdminClient();
        const res = await adminClient.from('faqs').insert([faq]).select().single();
        if (res.data) { data = res.data; error = null; }
      } catch {}
    }
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as FAQ };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error' };
  }
}

export async function updateFAQ(
  id: string,
  updates: Partial<FAQ>
): Promise<{ success: boolean; data?: FAQ; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { data, error } = await supabase.from('faqs').update(updates).eq('id', id).select().single();
    if (error) {
      try {
        const adminClient = createAdminClient();
        const res = await adminClient.from('faqs').update(updates).eq('id', id).select().single();
        if (res.data) { data = res.data; error = null; }
      } catch {}
    }
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as FAQ };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error' };
  }
}

export async function deleteFAQ(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) {
      try {
        const adminClient = createAdminClient();
        const res = await adminClient.from('faqs').delete().eq('id', id);
        error = res.error;
      } catch {}
    }
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error' };
  }
}

export async function getActivePromotions(includeAll = false): Promise<Promotion[]> {
  try {
    const supabase = await createServerSupabase();
    let query = supabase.from('promotions').select('*');
    if (!includeAll) {
      const today = new Date().toISOString().split('T')[0];
      query = query.eq('is_active', true).or(`end_date.is.null,end_date.gte.${today}`);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data as Promotion[];
  } catch {
    return [];
  }
}

export async function getPromotions(includeAll = true): Promise<Promotion[]> {
  return getActivePromotions(includeAll);
}

export async function createPromotion(
  promo: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: Promotion; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { data, error } = await supabase.from('promotions').insert([promo]).select().single();
    if (error) {
      try {
        const adminClient = createAdminClient();
        const res = await adminClient.from('promotions').insert([promo]).select().single();
        if (res.data) { data = res.data; error = null; }
      } catch {}
    }
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Promotion };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error' };
  }
}

export async function updatePromotion(
  id: string,
  updates: Partial<Promotion>
): Promise<{ success: boolean; data?: Promotion; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { data, error } = await supabase.from('promotions').update(updates).eq('id', id).select().single();
    if (error) {
      try {
        const adminClient = createAdminClient();
        const res = await adminClient.from('promotions').update(updates).eq('id', id).select().single();
        if (res.data) { data = res.data; error = null; }
      } catch {}
    }
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Promotion };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error' };
  }
}

export async function deletePromotion(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    let { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) {
      try {
        const adminClient = createAdminClient();
        const res = await adminClient.from('promotions').delete().eq('id', id);
        error = res.error;
      } catch {}
    }
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error' };
  }
}

// ----------------------------------------------------------------------
// 7. AUDIT LOGS
// ----------------------------------------------------------------------
export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown> = {},
  userEmail?: string
) {
  try {
    const supabase = await createServerSupabase();
    await supabase.from('audit_logs').insert([
      {
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        user_email: userEmail || 'system',
      },
    ]);
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as AuditLog[];
  } catch {
    return [];
  }
}

// ----------------------------------------------------------------------
// 10. ORDERS & E-COMMERCE
// ----------------------------------------------------------------------

export async function getOrders(statusFilter?: string): Promise<Order[]> {
  try {
    const supabase = await createServerSupabase();
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        payments(*),
        shipments(*)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'needs_attention') {
        query = query.in('status', ['payment_failed', 'shipping_failed']);
      } else {
        query = query.eq('status', statusFilter);
      }
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as unknown as Order[];
  } catch {
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        payments(*),
        shipments(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return data as unknown as Order;
  } catch {
    return null;
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        payments(*),
        shipments(*)
      `)
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error || !data) return null;
    return data as unknown as Order;
  } catch {
    return null;
  }
}

/**
 * Server-only lookup used by the public order tracker. The calling action must
 * verify the supplied phone number before returning any sanitized fields.
 */
export async function getOrderByNumberForTracking(orderNumber: string): Promise<Order | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_phone,
        created_at,
        status,
        payment_status,
        shipping_status,
        total_amount,
        shipping_city,
        shipping_state,
        shipping_pincode,
        items:order_items(
          id,
          order_id,
          product_name_snapshot,
          variant_title_snapshot,
          quantity,
          unit_price,
          line_total
        ),
        shipments(
          courier_name,
          awb_code,
          tracking_url,
          status
        )
      `)
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error || !data) return null;
    return data as unknown as Order;
  } catch {
    return null;
  }
}

export async function createPendingOrder(
  orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'items' | 'payments' | 'shipments'>,
  items: Array<Omit<OrderItem, 'id' | 'order_id' | 'created_at'>>
): Promise<{ success: boolean; data?: Order; error?: string }> {
  const supabase = createAdminClient();

  // 1. Attempt atomic PostgreSQL transaction via RPC
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_order_atomic', {
      p_order: orderData,
      p_items: items,
    });

    if (!rpcError && rpcData?.id) {
      return {
        success: true,
        data: {
          ...orderData,
          id: rpcData.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: items.map((i) => ({ ...i, id: '', order_id: rpcData.id, created_at: '' })),
        } as unknown as Order,
      };
    }
  } catch {
    // Proceed to fallback
  }

  // 2. Direct sequence with guaranteed compensating rollback
  let createdOrderId: string | null = null;
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError || !order) {
      return { success: false, error: orderError?.message || 'Failed to create order' };
    }

    createdOrderId = order.id;

    const orderItems = items.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      if (createdOrderId) {
        await supabase.from('orders').delete().eq('id', createdOrderId);
      }
      return { success: false, error: `Failed to record order items: ${itemsError.message}` };
    }

    return { success: true, data: { ...order, items: orderItems as unknown as OrderItem[] } };
  } catch (err: unknown) {
    if (createdOrderId) {
      try {
        await supabase.from('orders').delete().eq('id', createdOrderId);
      } catch {}
    }
    return { success: false, error: err instanceof Error ? err.message : 'Database error' };
  }
}

export async function attachRazorpayOrder(
  orderId: string,
  userId: string,
  razorpayOrderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .update({
        razorpay_order_id: razorpayOrderId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('user_id', userId)
      .eq('payment_status', 'pending')
      .is('razorpay_order_id', null)
      .select('id')
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: 'Could not securely attach payment order' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Database error' };
  }
}

export async function updateOrderPaymentSuccess(
  orderId: string,
  razorpayDetails: {
    razorpayOrderId: string;
    razorpayPaymentId?: string | null;
    razorpaySignature?: string;
    amount: number;
    currency: string;
    method?: string;
    rawPayload?: Record<string, unknown>;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    // Update order status to paid
    const { data: updatedOrder, error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_status: 'paid',
        razorpay_order_id: razorpayDetails.razorpayOrderId,
        razorpay_payment_id: razorpayDetails.razorpayPaymentId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('payment_status', 'pending')
      .eq('razorpay_order_id', razorpayDetails.razorpayOrderId)
      .select('id')
      .maybeSingle();

    if (orderError || !updatedOrder) {
      return { success: false, error: 'Payment was already processed or does not match this order' };
    }

    // Record payment snapshot
    await supabase.from('payments').insert([
      {
        order_id: orderId,
        gateway: 'razorpay',
        razorpay_order_id: razorpayDetails.razorpayOrderId,
        razorpay_payment_id: razorpayDetails.razorpayPaymentId || null,
        razorpay_signature: razorpayDetails.razorpaySignature || null,
        amount: razorpayDetails.amount,
        currency: razorpayDetails.currency,
        status: 'captured',
        method: razorpayDetails.method || 'online',
        raw_payload: razorpayDetails.rawPayload || {},
      },
    ]);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Payment update error' };
  }
}

export async function recordShipment(
  shipmentData: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: Shipment; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('shipments')
      .insert([shipmentData])
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // Update order shipping status
    await supabase
      .from('orders')
      .update({
        shipping_status: shipmentData.status === 'created' ? 'created' : 'pending',
        status: shipmentData.status === 'created' ? 'shipment_pending' : 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipmentData.order_id);

    return { success: true, data: data as Shipment };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Shipment recording error' };
  }
}

export async function updateOrderAdmin(
  orderId: string,
  updateData: {
    status?: OrderStatus;
    shipping_status?: string;
    internal_notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from('orders')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Order update error' };
  }
}

export async function recordIntegrationLog(
  service: 'odoo' | 'shipping' | 'razorpay' | 'shiprocket',
  action: string,
  status: 'success' | 'failed' | 'pending',
  requestPayload?: Record<string, unknown> | null,
  responsePayload?: Record<string, unknown> | null,
  errorMessage?: string | null
) {
  try {
    const supabase = createAdminClient();
    await supabase.from('integration_logs').insert([
      {
        service,
        action,
        status,
        request_payload: requestPayload || null,
        response_payload: responsePayload || null,
        error_message: errorMessage || null,
      },
    ]);
  } catch (err) {
    console.error('Integration log error:', err);
  }
}
