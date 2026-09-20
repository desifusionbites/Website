// ========================================================================
// DESI FUSION BITES - DATABASE & CMS TYPES
// ========================================================================

export type UserRole = 'owner' | 'admin' | 'staff' | 'customer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface WebsiteSettings {
  id: string;
  brand_name: string;
  tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  proprietor: string;
  contact_person: string;
  phone: string;
  whatsapp: string;
  email: string;
  address_line1: string;
  address_line2: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  fssai_license: string;
  opening_hours: string;
  instagram_handle: string;
  instagram_url: string;
  youtube_handle: string;
  youtube_url: string;
  google_business_url: string | null;
  maps_embed_url: string | null;
  hero_badge: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_text: string | null;
  hero_cta_url: string | null;
  hero_image_url: string | null;
  story_title: string | null;
  story_paragraphs: string[] | null;
  about_image_url: string | null;
  footer_text: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WebsiteSection {
  id: string;
  name: string;
  display_order: number;
  is_enabled: boolean;
  title: string | null;
  subtitle: string | null;
  custom_content?: Record<string, unknown>;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type AvailabilityStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface NutritionFact {
  label: string;
  value: string;
  per?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category_id: string | null;
  category?: Category | null;
  millet_type: string | null;
  flavour: string | null;
  short_description: string | null;
  full_description: string | null;
  ingredients: string | null;
  allergens: string | null;
  nutritional_info: NutritionFact[] | Record<string, string> | null;
  weight: string | null;
  pack_size: string | null;
  mrp: number | null;
  selling_price: number | null;
  wholesale_price: number | null;
  moq: number;
  availability: AvailabilityStatus;
  is_featured: boolean;
  is_published: boolean;
  primary_image_url: string | null;
  gallery_images: string[] | null;
  odoo_product_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  display_order: number;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string;
  millet_type: string | null;
  flavour: string | null;
  pack_size: string | null;
  sku: string | null;
  mrp: number | null;
  selling_price: number | null;
  wholesale_price: number | null;
  stock_status: AvailabilityStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  location: string | null;
  rating: number;
  review_text: string;
  product_reference: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  banner_text: string;
  badge_text: string | null;
  cta_label: string | null;
  cta_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type EnquiryType = 'general' | 'product' | 'wholesale' | 'distributor' | 'retailer';
export type EnquiryStatus = 'new' | 'read' | 'contacted' | 'pending' | 'completed' | 'archived';
export type OdooSyncStatus = 'not_synced' | 'pending' | 'synced' | 'failed';

export interface Enquiry {
  id: string;
  type: EnquiryType;
  name: string;
  phone: string;
  email: string | null;
  whatsapp: string | null;
  business_name: string | null;
  city: string | null;
  state: string | null;
  product_interest: string | null;
  estimated_quantity: string | null;
  message: string;
  status: EnquiryStatus;
  internal_notes: string | null;
  odoo_lead_id: string | null;
  odoo_sync_status: OdooSyncStatus;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface IntegrationLog {
  id: string;
  service: 'odoo' | 'shipping' | 'razorpay' | 'shiprocket';
  action: string;
  status: 'success' | 'failed' | 'pending';
  request_payload: Record<string, unknown> | null;
  response_payload: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
}

// ----------------------------------------------------------------------
// E-COMMERCE ORDERS, PAYMENTS & SHIPMENTS
// ----------------------------------------------------------------------

export type OrderStatus =
  | 'payment_pending'
  | 'paid'
  | 'processing'
  | 'shipment_pending'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'payment_failed'
  | 'shipping_failed';

export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded';

export type ShippingStatus =
  | 'unfulfilled'
  | 'pending'
  | 'created'
  | 'pickup_scheduled'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name_snapshot: string;
  variant_title_snapshot: string | null;
  sku_snapshot: string | null;
  image_url_snapshot: string | null;
  weight_snapshot: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  gateway: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  method: string | null;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_reason: string | null;
  raw_payload?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  provider: 'shiprocket' | 'manual';
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  awb_code: string | null;
  courier_name: string | null;
  courier_id: string | null;
  tracking_url: string | null;
  label_url: string | null;
  manifest_url: string | null;
  pickup_location: string | null;
  pickup_scheduled_date: string | null;
  status: string;
  error_details: string | null;
  raw_response?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_country: string;
  subtotal_amount: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_status: ShippingStatus;
  payment_method: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  customer_notes: string | null;
  internal_notes: string | null;
  items?: OrderItem[];
  payments?: Payment[];
  shipments?: Shipment[];
  created_at: string;
  updated_at: string;
}
