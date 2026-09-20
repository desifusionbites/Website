// ========================================================================
// CMS UI & FORM TYPES
// ========================================================================

import { Enquiry, AuditLog } from './database';

export interface AdminDashboardStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalEnquiries: number;
  unreadEnquiries: number;
  wholesaleEnquiries: number;
  odooSyncStatus: {
    enabled: boolean;
    pendingCount: number;
    failedCount: number;
  };
  recentEnquiries: Enquiry[];
  recentAuditLogs: AuditLog[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProductFormData {
  name: string;
  slug?: string;
  sku?: string;
  category_id?: string;
  millet_type?: string;
  flavour?: string;
  short_description?: string;
  full_description?: string;
  ingredients?: string;
  allergens?: string;
  nutritional_info?: string;
  weight?: string;
  pack_size?: string;
  mrp?: number;
  selling_price?: number;
  wholesale_price?: number;
  moq?: number;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  is_featured: boolean;
  is_published: boolean;
  primary_image_url?: string;
  gallery_images?: string[];
  odoo_product_id?: string;
  seo_title?: string;
  seo_description?: string;
  display_order?: number;
}
