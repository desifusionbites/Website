-- ========================================================================
-- DESI FUSION BITES - DATABASE SCHEMA MIGRATION 00001
-- PostgreSQL / Supabase
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. WEBSITE SETTINGS (Single-row configuration for core business details & branding)
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
    hero_badge TEXT DEFAULT 'Handcrafted Indian Packed Foods & Snacks',
    hero_title TEXT DEFAULT 'Authentic Indian Taste with a Modern Twist',
    hero_subtitle TEXT DEFAULT 'Crafted with premium natural ingredients, authentic traditional spice blends, and uncompromised quality.',
    hero_cta_text TEXT DEFAULT 'Explore Products',
    hero_cta_url TEXT DEFAULT '/products',
    hero_image_url TEXT,
    story_title TEXT DEFAULT 'Our Heritage & Passion',
    story_paragraphs JSONB DEFAULT '["Desi Fusion Bites was born from a passion to bring authentic, traditional Indian flavours to modern households.", "Every batch is prepared with strict adherence to hygiene, quality ingredients, and the warmth of home-style recipes."]'::jsonb,
    about_image_url TEXT,
    footer_text TEXT DEFAULT 'Delighting tastebuds with pure Indian packaged food goodness.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. WEBSITE SECTIONS (Dynamic toggle and ordering for homepage sections)
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

-- 4. CATEGORIES TABLE (Empty by default - Owner creates them)
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

-- 5. PRODUCTS TABLE (Empty by default - Owner creates them)
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

-- 6. PRODUCT VARIANTS TABLE
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

-- 7. FAQS TABLE (Owner manages via Admin)
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

-- 8. TESTIMONIALS TABLE (Owner manages via Admin - No fabricated reviews)
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

-- 9. PROMOTIONS & ANNOUNCEMENT BANNERS
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

-- 10. ENQUIRIES TABLE (Customer & Wholesale B2B Submissions)
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

-- 11. AUDIT LOGS TABLE
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

-- 12. INTEGRATION LOGS TABLE (Odoo & Shipping execution audit)
CREATE TABLE IF NOT EXISTS public.integration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service TEXT NOT NULL CHECK (service IN ('odoo', 'shipping')),
    action TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    request_payload JSONB,
    response_payload JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_type ON public.enquiries(type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON public.integration_logs(created_at DESC);

-- AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY['profiles', 'website_settings', 'website_sections', 'categories', 'products', 'product_variants', 'faqs', 'testimonials', 'promotions', 'enquiries'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_%s_updated_at ON public.%s;', t, t);
        EXECUTE format('CREATE TRIGGER tr_%s_updated_at BEFORE UPDATE ON public.%s FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();', t, t);
    END LOOP;
END;
$$;
