import { createClient as createServerSupabase } from '@/lib/supabase/server';
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
    const { data, error } = await supabase
      .from('website_settings')
      .upsert({ ...settings, id: 'current', updated_at: new Date().toISOString() })
      .select()
      .single();

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
    const { error } = await supabase
      .from('website_sections')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

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
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

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
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Category };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update category' };
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from('categories').delete().eq('id', id);
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
    const supabase = await createServerSupabase();
    const { data: newProduct, error: prodError } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

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
        console.error('Variant insert error:', varError);
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

    const { data: updatedProduct, error: prodError } = await supabase
      .from('products')
      .update(cleanedProductData)
      .eq('id', id)
      .select()
      .single();

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
    const { error } = await supabase.from('products').delete().eq('id', id);
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
    const { data, error } = await supabase.from('testimonials').insert([testimonial]).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Testimonial };
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
    const { data, error } = await supabase.from('faqs').insert([faq]).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as FAQ };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Error' };
  }
}

export async function getActivePromotions(): Promise<Promotion[]> {
  try {
    const supabase = await createServerSupabase();
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .or(`end_date.is.null,end_date.gte.${today}`);

    if (error || !data) return [];
    return data as Promotion[];
  } catch {
    return [];
  }
}

export async function createPromotion(
  promo: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: Promotion; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.from('promotions').insert([promo]).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Promotion };
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
