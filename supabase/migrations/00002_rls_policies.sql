-- ========================================================================
-- DESI FUSION BITES - DATABASE SECURITY & RLS POLICIES (00002)
-- ========================================================================

-- Enable Row Level Security on all tables
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

-- Helper function to fetch role of the currently authenticated user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT COALESCE(
        (SELECT role FROM public.profiles WHERE id = auth.uid()),
        'anonymous'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.current_user_role() IN ('owner', 'admin'));

CREATE POLICY "Users can update their own non-role profile fields"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.current_user_role() = 'owner');

-- 2. WEBSITE SETTINGS POLICIES
CREATE POLICY "Website settings are publicly readable"
    ON public.website_settings FOR SELECT
    USING (true);

CREATE POLICY "Only Owner and Admin can modify website settings"
    ON public.website_settings FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'));

-- 3. WEBSITE SECTIONS POLICIES
CREATE POLICY "Website sections are publicly readable"
    ON public.website_sections FOR SELECT
    USING (true);

CREATE POLICY "Only Owner and Admin can manage sections"
    ON public.website_sections FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'));

-- 4. CATEGORIES POLICIES
CREATE POLICY "Public can view published categories, Admins view all"
    ON public.categories FOR SELECT
    USING (is_published = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "Only Owner and Admin can manage categories"
    ON public.categories FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'));

-- 5. PRODUCTS POLICIES
CREATE POLICY "Public can view published products, Admins view all"
    ON public.products FOR SELECT
    USING (is_published = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "Only Owner and Admin can manage products"
    ON public.products FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'));

-- 6. PRODUCT VARIANTS POLICIES
CREATE POLICY "Public can view active product variants, Admins view all"
    ON public.product_variants FOR SELECT
    USING (is_active = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "Only Owner and Admin can manage variants"
    ON public.product_variants FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'));

-- 7. FAQS POLICIES
CREATE POLICY "Public can view published FAQs, Admins view all"
    ON public.faqs FOR SELECT
    USING (is_published = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "Only Owner and Admin can manage FAQs"
    ON public.faqs FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'));

-- 8. TESTIMONIALS POLICIES
CREATE POLICY "Public can view published testimonials, Admins view all"
    ON public.testimonials FOR SELECT
    USING (is_published = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "Only Owner and Admin can manage testimonials"
    ON public.testimonials FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'));

-- 9. PROMOTIONS POLICIES
CREATE POLICY "Public can view active promotions, Admins view all"
    ON public.promotions FOR SELECT
    USING (is_active = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "Only Owner and Admin can manage promotions"
    ON public.promotions FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'));

-- 10. ENQUIRIES POLICIES
CREATE POLICY "Anyone can submit an enquiry"
    ON public.enquiries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Only authorized staff can view/manage enquiries"
    ON public.enquiries FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "Only authorized staff can update enquiries"
    ON public.enquiries FOR UPDATE
    USING (public.current_user_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "Only Owner and Admin can delete enquiries"
    ON public.enquiries FOR DELETE
    USING (public.current_user_role() IN ('owner', 'admin'));

-- 11. AUDIT & INTEGRATION LOGS POLICIES
CREATE POLICY "Only Owner and Admin can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin'));

CREATE POLICY "System can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Only Owner and Admin can view integration logs"
    ON public.integration_logs FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin'));

CREATE POLICY "System can insert integration logs"
    ON public.integration_logs FOR INSERT
    WITH CHECK (true);

-- STORAGE BUCKETS (Create default storage buckets if using Supabase Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Public Access to media buckets"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('media', 'branding', 'products'));

CREATE POLICY "Authenticated Admin uploads to media buckets"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id IN ('media', 'branding', 'products') AND
        public.current_user_role() IN ('owner', 'admin', 'staff')
    );

CREATE POLICY "Admin delete from media buckets"
    ON storage.objects FOR DELETE
    USING (
        bucket_id IN ('media', 'branding', 'products') AND
        public.current_user_role() IN ('owner', 'admin')
    );
