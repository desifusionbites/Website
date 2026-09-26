-- ========================================================================
-- DESI FUSION BITES - ALL DATABASE MIGRATIONS COMBINED (00001 - 00004)
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xsffgslecghktthywefe/sql/new
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================================
-- 1. CORE TABLES & ENUMS
-- ========================================================================

-- 1.1 PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.2 WEBSITE SETTINGS (Single-row configuration for core business details & branding)
CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    brand_name TEXT NOT NULL DEFAULT 'Desi Fusion Bites',
    tagline TEXT NOT NULL DEFAULT 'Purana Swad Naya Tadka',
    logo_url TEXT,
    favicon_url TEXT,
    proprietor TEXT NOT NULL DEFAULT 'Aruna Harlalka',
    contact_person TEXT NOT NULL DEFAULT 'Priya Harlalka',
    phone TEXT NOT NULL DEFAULT '9051941774',
    whatsapp TEXT NOT NULL DEFAULT '9051941774',
    email TEXT NOT NULL DEFAULT 'desifusionbites@gmail.com',
    address_line1 TEXT NOT NULL DEFAULT '275 Dwarika Jungle Road',
    address_line2 TEXT NOT NULL DEFAULT 'P.O. Bhadrakali, P.S. Uttarpara',
    district TEXT NOT NULL DEFAULT 'Hooghly District',
    state TEXT NOT NULL DEFAULT 'West Bengal',
    pincode TEXT NOT NULL DEFAULT '712232',
    country TEXT NOT NULL DEFAULT 'India',
    fssai_license TEXT NOT NULL DEFAULT '12826999000591',
    opening_hours TEXT NOT NULL DEFAULT '8:00 AM to 8:00 PM',
    instagram_handle TEXT NOT NULL DEFAULT '@desifusionbite',
    instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com/desifusionbite',
    youtube_handle TEXT NOT NULL DEFAULT '@desifusionbite',
    youtube_url TEXT NOT NULL DEFAULT 'https://youtube.com/@desifusionbite',
    google_business_url TEXT,
    maps_embed_url TEXT,
    hero_badge TEXT DEFAULT 'Packaged Foods & Indian Snacks',
    hero_title TEXT DEFAULT 'Purana Swad, Naya Tadka',
    hero_subtitle TEXT DEFAULT 'Indian packaged foods and snacks by Desi Fusion Bites, located in Hooghly District, West Bengal.',
    hero_cta_text TEXT DEFAULT 'Explore Products',
    hero_cta_url TEXT DEFAULT '/products',
    hero_image_url TEXT,
    story_title TEXT DEFAULT 'About Desi Fusion Bites',
    story_paragraphs JSONB DEFAULT '["Desi Fusion Bites is an Indian packaged food brand managed by proprietor Aruna Harlalka and contact lead Priya Harlalka.", "Operating under FSSAI License No. 12826999000591, located at 275 Dwarika Jungle Road, P.O. Bhadrakali, P.S. Uttarpara, Hooghly District, West Bengal - 712232."]'::jsonb,
    about_image_url TEXT,
    footer_text TEXT DEFAULT 'Packaged food products by Desi Fusion Bites.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.3 WEBSITE SECTIONS
CREATE TABLE IF NOT EXISTS public.website_sections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    title TEXT,
    subtitle TEXT,
    custom_content JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.4 CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.5 PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    millet_type TEXT,
    flavour TEXT,
    short_description TEXT,
    full_description TEXT,
    ingredients TEXT,
    allergens TEXT,
    nutritional_info JSONB DEFAULT '{}'::jsonb,
    weight TEXT,
    pack_size TEXT,
    mrp NUMERIC(10, 2),
    selling_price NUMERIC(10, 2),
    wholesale_price NUMERIC(10, 2),
    moq INT DEFAULT 1,
    availability TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'low_stock', 'out_of_stock')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT false,
    primary_image_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    odoo_product_id TEXT,
    seo_title TEXT,
    seo_description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.6 PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    millet_type TEXT,
    flavour TEXT,
    pack_size TEXT,
    sku TEXT,
    mrp NUMERIC(10, 2),
    selling_price NUMERIC(10, 2),
    wholesale_price NUMERIC(10, 2),
    stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.7 FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    display_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.8 TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    location TEXT,
    rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    product_reference TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.9 PROMOTIONS & ANNOUNCEMENT BANNERS
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    banner_text TEXT NOT NULL,
    badge_text TEXT,
    cta_label TEXT,
    cta_url TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.10 ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'product', 'wholesale', 'distributor', 'retailer')),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    whatsapp TEXT,
    business_name TEXT,
    city TEXT,
    state TEXT,
    product_interest TEXT,
    estimated_quantity TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'contacted', 'pending', 'completed', 'archived')),
    internal_notes TEXT,
    odoo_lead_id TEXT,
    odoo_sync_status TEXT NOT NULL DEFAULT 'not_synced' CHECK (odoo_sync_status IN ('not_synced', 'pending', 'synced', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.11 AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.12 INTEGRATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.integration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service TEXT NOT NULL CHECK (service IN ('odoo', 'shipping', 'razorpay', 'shiprocket')),
    action TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    request_payload JSONB,
    response_payload JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================================
-- 2. E-COMMERCE ORDERS, PAYMENTS & SHIPMENTS
-- ========================================================================

-- 2.1 ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    
    -- Delivery Address
    shipping_address_line1 TEXT NOT NULL,
    shipping_address_line2 TEXT,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_pincode TEXT NOT NULL,
    shipping_country TEXT NOT NULL DEFAULT 'India',
    
    -- Financial Breakdown
    subtotal_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'INR',
    
    -- Status Lifecycles
    status TEXT NOT NULL DEFAULT 'payment_pending' CHECK (
        status IN (
            'payment_pending',
            'paid',
            'processing',
            'shipment_pending',
            'shipped',
            'delivered',
            'cancelled',
            'payment_failed',
            'shipping_failed'
        )
    ),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'authorized', 'paid', 'failed', 'refunded')
    ),
    shipping_status TEXT NOT NULL DEFAULT 'unfulfilled' CHECK (
        shipping_status IN (
            'unfulfilled',
            'pending',
            'created',
            'pickup_scheduled',
            'in_transit',
            'out_for_delivery',
            'delivered',
            'failed',
            'cancelled'
        )
    ),
    
    -- Payment & Gateway References
    payment_method TEXT NOT NULL DEFAULT 'razorpay',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    
    -- Administrative
    customer_notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 ORDER ITEMS TABLE (Immutable snapshot at time of purchase)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    
    product_name_snapshot TEXT NOT NULL,
    variant_title_snapshot TEXT,
    sku_snapshot TEXT,
    image_url_snapshot TEXT,
    weight_snapshot TEXT,
    
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(10, 2) NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    gateway TEXT NOT NULL DEFAULT 'razorpay',
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (
        status IN ('created', 'authorized', 'captured', 'failed', 'refunded')
    ),
    method TEXT,
    
    error_code TEXT,
    error_description TEXT,
    error_source TEXT,
    error_reason TEXT,
    
    raw_payload JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 SHIPMENTS TABLE
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    provider TEXT NOT NULL DEFAULT 'shiprocket' CHECK (provider IN ('shiprocket', 'manual')),
    shiprocket_order_id TEXT,
    shiprocket_shipment_id TEXT,
    awb_code TEXT,
    courier_name TEXT,
    courier_id TEXT,
    
    tracking_url TEXT,
    label_url TEXT,
    manifest_url TEXT,
    
    pickup_location TEXT,
    pickup_scheduled_date TIMESTAMPTZ,
    
    status TEXT NOT NULL DEFAULT 'pending',
    error_details TEXT,
    raw_response JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================================
-- 3. INDEXES
-- ========================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_type ON public.enquiries(type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON public.integration_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON public.payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_awb_code ON public.shipments(awb_code);
CREATE INDEX IF NOT EXISTS idx_shipments_shiprocket_order_id ON public.shipments(shiprocket_order_id);

-- ========================================================================
-- 4. AUTOMATIC UPDATED_AT TRIGGER
-- ========================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY['profiles', 'website_settings', 'website_sections', 'categories', 'products', 'product_variants', 'faqs', 'testimonials', 'promotions', 'enquiries', 'orders', 'payments', 'shipments'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_%s_updated_at ON public.%s;', t, t);
        EXECUTE format('CREATE TRIGGER tr_%s_updated_at BEFORE UPDATE ON public.%s FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();', t, t);
    END LOOP;
END;
$$;

-- ========================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES & PRIVILEGE GUARDS
-- ========================================================================

-- Schema Grants: Ensure authenticated and anon roles have access to public tables
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch role of the currently authenticated user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT COALESCE(
        (SELECT role FROM public.profiles WHERE id = auth.uid()),
        'anonymous'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO postgres, anon, authenticated, service_role;

-- Trigger to prevent privilege escalation: non-owners can NEVER modify roles
CREATE OR REPLACE FUNCTION public.check_profile_role_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF public.current_user_role() <> 'owner' THEN
            RAISE EXCEPTION 'Unauthorized: Only the account owner can change user roles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
CREATE TRIGGER tr_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.check_profile_role_update();

-- 5.1 Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile, Admins view all" ON public.profiles;
CREATE POLICY "Users can view their own profile, Admins view all"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.current_user_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Users can update their own profile details" ON public.profiles;
CREATE POLICY "Users can update their own profile details"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.current_user_role() = 'owner')
    WITH CHECK (auth.uid() = id OR public.current_user_role() = 'owner');

-- 5.2 Settings & Sections
DROP POLICY IF EXISTS "Website settings are publicly readable" ON public.website_settings;
CREATE POLICY "Website settings are publicly readable"
    ON public.website_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only Owner and Admin can modify website settings" ON public.website_settings;
CREATE POLICY "Only Owner and Admin can modify website settings"
    ON public.website_settings FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Website sections are publicly readable" ON public.website_sections;
CREATE POLICY "Website sections are publicly readable"
    ON public.website_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only Owner and Admin can manage sections" ON public.website_sections;
CREATE POLICY "Only Owner and Admin can manage sections"
    ON public.website_sections FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

-- 5.3 Categories & Products
DROP POLICY IF EXISTS "Public can view published categories, Admins view all" ON public.categories;
CREATE POLICY "Public can view published categories, Admins view all"
    ON public.categories FOR SELECT
    USING (is_published = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can manage categories" ON public.categories;
CREATE POLICY "Only Owner and Admin can manage categories"
    ON public.categories FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Public can view published products, Admins view all" ON public.products;
CREATE POLICY "Public can view published products, Admins view all"
    ON public.products FOR SELECT
    USING (is_published = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can manage products" ON public.products;
CREATE POLICY "Only Owner and Admin can manage products"
    ON public.products FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Public can view active variants, Admins view all" ON public.product_variants;
CREATE POLICY "Public can view active variants, Admins view all"
    ON public.product_variants FOR SELECT
    USING (is_active = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can manage variants" ON public.product_variants;
CREATE POLICY "Only Owner and Admin can manage variants"
    ON public.product_variants FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

-- 5.4 FAQs, Testimonials, Promotions
DROP POLICY IF EXISTS "Public can view published FAQs, Admins view all" ON public.faqs;
CREATE POLICY "Public can view published FAQs, Admins view all"
    ON public.faqs FOR SELECT
    USING (is_published = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can manage faqs" ON public.faqs;
CREATE POLICY "Only Owner and Admin can manage faqs"
    ON public.faqs FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Public can view published testimonials, Admins view all" ON public.testimonials;
CREATE POLICY "Public can view published testimonials, Admins view all"
    ON public.testimonials FOR SELECT
    USING (is_published = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can manage testimonials" ON public.testimonials;
CREATE POLICY "Only Owner and Admin can manage testimonials"
    ON public.testimonials FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Public can view active promotions, Admins view all" ON public.promotions;
CREATE POLICY "Public can view active promotions, Admins view all"
    ON public.promotions FOR SELECT
    USING (is_active = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can manage promotions" ON public.promotions;
CREATE POLICY "Only Owner and Admin can manage promotions"
    ON public.promotions FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

-- 5.5 Enquiries
DROP POLICY IF EXISTS "Anyone can submit an enquiry" ON public.enquiries;
CREATE POLICY "Anyone can submit an enquiry"
    ON public.enquiries FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Staff and Admins can view enquiries" ON public.enquiries;
CREATE POLICY "Staff and Admins can view enquiries"
    ON public.enquiries FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff and Admins can update enquiries" ON public.enquiries;
CREATE POLICY "Staff and Admins can update enquiries"
    ON public.enquiries FOR UPDATE
    USING (public.current_user_role() IN ('owner', 'admin', 'staff'));

-- 5.6 Audit Logs & Integration Logs
DROP POLICY IF EXISTS "Only Owner and Admin can view audit logs" ON public.audit_logs;
CREATE POLICY "Only Owner and Admin can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Only authenticated staff can insert audit logs" ON public.audit_logs;
CREATE POLICY "Only authenticated staff can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can view integration logs" ON public.integration_logs;
CREATE POLICY "Only Owner and Admin can view integration logs"
    ON public.integration_logs FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Only authenticated staff can insert integration logs" ON public.integration_logs;
CREATE POLICY "Only authenticated staff can insert integration logs"
    ON public.integration_logs FOR INSERT
    WITH CHECK (public.current_user_role() IN ('owner', 'admin', 'staff'));

-- 5.7 E-Commerce Orders, Order Items, Payments & Shipments
DROP POLICY IF EXISTS "Public can create pending orders" ON public.orders;
CREATE POLICY "Public can create pending orders"
    ON public.orders FOR INSERT
    WITH CHECK (status = 'payment_pending');

DROP POLICY IF EXISTS "Staff can view all orders" ON public.orders;
CREATE POLICY "Staff can view all orders"
    ON public.orders FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can update orders" ON public.orders;
CREATE POLICY "Only Owner and Admin can update orders"
    ON public.orders FOR UPDATE
    USING (public.current_user_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view order items" ON public.order_items;
CREATE POLICY "Staff can view order items"
    ON public.order_items FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff can view payments" ON public.payments;
CREATE POLICY "Staff can view payments"
    ON public.payments FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff can view shipments" ON public.shipments;
CREATE POLICY "Staff can view shipments"
    ON public.shipments FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can update shipments" ON public.shipments;
CREATE POLICY "Only Owner and Admin can update shipments"
    ON public.shipments FOR UPDATE
    USING (public.current_user_role() IN ('owner', 'admin'));

-- ========================================================================
-- 6. VERIFIED BUSINESS SEED DATA
-- ========================================================================

INSERT INTO public.website_settings (
    id,
    brand_name,
    tagline,
    proprietor,
    contact_person,
    phone,
    whatsapp,
    email,
    address_line1,
    address_line2,
    district,
    state,
    pincode,
    country,
    fssai_license,
    opening_hours,
    instagram_handle,
    instagram_url,
    youtube_handle,
    youtube_url,
    hero_badge,
    hero_title,
    hero_subtitle,
    hero_cta_text,
    hero_cta_url,
    story_title,
    story_paragraphs,
    footer_text
) VALUES (
    'current',
    'Desi Fusion Bites',
    'Purana Swad Naya Tadka',
    'Aruna Harlalka',
    'Priya Harlalka',
    '9051941774',
    '9051941774',
    'desifusionbites@gmail.com',
    '275 Dwarika Jungle Road',
    'P.O. Bhadrakali, P.S. Uttarpara',
    'Hooghly District',
    'West Bengal',
    '712232',
    'India',
    '12826999000591',
    '8:00 AM to 8:00 PM',
    '@desifusionbite',
    'https://instagram.com/desifusionbite',
    '@desifusionbite',
    'https://youtube.com/@desifusionbite',
    'Packaged Foods & Indian Snacks',
    'Purana Swad, Naya Tadka',
    'Indian packaged foods and snacks by Desi Fusion Bites, located in Hooghly District, West Bengal.',
    'Explore Products',
    '/products',
    'About Desi Fusion Bites',
    '["Desi Fusion Bites is an Indian packaged food brand managed by proprietor Aruna Harlalka and contact lead Priya Harlalka.", "Operating under FSSAI License No. 12826999000591, located at 275 Dwarika Jungle Road, P.O. Bhadrakali, P.S. Uttarpara, Hooghly District, West Bengal - 712232."]'::jsonb,
    'Packaged food products by Desi Fusion Bites.'
)
ON CONFLICT (id) DO UPDATE SET
    brand_name = EXCLUDED.brand_name,
    tagline = EXCLUDED.tagline,
    proprietor = EXCLUDED.proprietor,
    contact_person = EXCLUDED.contact_person,
    phone = EXCLUDED.phone,
    whatsapp = EXCLUDED.whatsapp,
    email = EXCLUDED.email,
    fssai_license = EXCLUDED.fssai_license,
    opening_hours = EXCLUDED.opening_hours;

INSERT INTO public.website_sections (id, name, display_order, is_enabled, title, subtitle)
VALUES 
    ('hero', 'Hero Banner', 1, true, 'Purana Swad, Naya Tadka', 'Desi Fusion Bites'),
    ('categories', 'Product Categories', 2, true, 'Product Categories', 'Browse available packaged food categories'),
    ('featured_products', 'Featured Products', 3, true, 'Featured Products', 'Featured packaged food selections'),
    ('story_preview', 'Brand Story Preview', 4, true, 'About Desi Fusion Bites', 'Business background and details'),
    ('wholesale_cta', 'Wholesale & Distributor Banner', 5, true, 'Wholesale & Distributor Inquiries', 'Commercial supply for distributors, retailers, and resellers'),
    ('testimonials', 'Customer Testimonials', 6, true, 'Customer Feedback', 'Feedback from verified customers'),
    ('contact_preview', 'Visit & Contact Us', 7, true, 'Contact Us', 'Located in Hooghly District, West Bengal.')
ON CONFLICT (id) DO NOTHING;

-- ========================================================================
-- 7. CUSTOMER AUTH & AUTOMATIC ROLE ASSIGNMENT TRIGGER
-- ========================================================================

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('owner', 'admin', 'staff', 'customer'));

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE 
            WHEN LOWER(TRIM(NEW.email)) = 'desifusionbites@gmail.com' THEN 'owner'
            ELSE 'customer'
        END
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
        role = CASE 
            WHEN LOWER(TRIM(EXCLUDED.email)) = 'desifusionbites@gmail.com' THEN 'owner'
            ELSE public.profiles.role
        END,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
CREATE POLICY "Customers can view their own orders"
    ON public.orders FOR SELECT
    USING (
        LOWER(customer_email) = LOWER(auth.jwt()->>'email')
        OR public.current_user_role() IN ('owner', 'admin', 'staff')
    );

DROP POLICY IF EXISTS "Customers can view their own order items" ON public.order_items;
CREATE POLICY "Customers can view their own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (
                LOWER(orders.customer_email) = LOWER(auth.jwt()->>'email')
                OR public.current_user_role() IN ('owner', 'admin', 'staff')
            )
        )
    );

-- Delivery & Shipping Settings
ALTER TABLE public.website_settings ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) DEFAULT 60.00;
ALTER TABLE public.website_settings ADD COLUMN IF NOT EXISTS free_delivery_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.website_settings ADD COLUMN IF NOT EXISTS free_delivery_min_amount NUMERIC(10, 2) DEFAULT NULL;

