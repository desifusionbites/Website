-- ========================================================================
-- DESI FUSION BITES - SCHEMA GRANTS & RLS REPAIR (00007)
-- Fixes "permission denied for table website_settings" & provides WITH CHECK
-- ========================================================================

-- 1. Grant Schema Usage & Privileges to all Postgres standard roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 2. Ensure current_user_role function is SECURITY DEFINER with execute grants
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT COALESCE(
        (SELECT role FROM public.profiles WHERE id = auth.uid()),
        'anonymous'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO postgres, anon, authenticated, service_role;

-- 3. Fix website_settings RLS Policies
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Website settings are publicly readable" ON public.website_settings;
CREATE POLICY "Website settings are publicly readable"
    ON public.website_settings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Only Owner and Admin can modify website settings" ON public.website_settings;
CREATE POLICY "Only Owner and Admin can modify website settings"
    ON public.website_settings FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

-- 4. Fix website_sections RLS Policies
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Website sections are publicly readable" ON public.website_sections;
CREATE POLICY "Website sections are publicly readable"
    ON public.website_sections FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Only Owner and Admin can manage sections" ON public.website_sections;
CREATE POLICY "Only Owner and Admin can manage sections"
    ON public.website_sections FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

-- 5. Fix categories RLS Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published categories, Admins view all" ON public.categories;
CREATE POLICY "Public can view published categories, Admins view all"
    ON public.categories FOR SELECT
    USING (is_published = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can manage categories" ON public.categories;
CREATE POLICY "Only Owner and Admin can manage categories"
    ON public.categories FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

-- 6. Fix products RLS Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published products, Admins view all" ON public.products;
CREATE POLICY "Public can view published products, Admins view all"
    ON public.products FOR SELECT
    USING (is_published = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can manage products" ON public.products;
CREATE POLICY "Only Owner and Admin can manage products"
    ON public.products FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

-- 7. Fix product_variants RLS Policies
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active variants, Admins view all" ON public.product_variants;
CREATE POLICY "Public can view active variants, Admins view all"
    ON public.product_variants FOR SELECT
    USING (is_active = true OR public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can manage variants" ON public.product_variants;
CREATE POLICY "Only Owner and Admin can manage variants"
    ON public.product_variants FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

-- 8. Fix FAQs, Testimonials, Promotions
DROP POLICY IF EXISTS "Only Owner and Admin can manage FAQs" ON public.faqs;
CREATE POLICY "Only Owner and Admin can manage FAQs"
    ON public.faqs FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Only Owner and Admin can manage testimonials" ON public.testimonials;
CREATE POLICY "Only Owner and Admin can manage testimonials"
    ON public.testimonials FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Only Owner and Admin can manage promotions" ON public.promotions;
CREATE POLICY "Only Owner and Admin can manage promotions"
    ON public.promotions FOR ALL
    USING (public.current_user_role() IN ('owner', 'admin'))
    WITH CHECK (public.current_user_role() IN ('owner', 'admin'));

-- 9. Storage Object Policies
DROP POLICY IF EXISTS "Only Owner and Admin can upload to media and branding buckets" ON storage.objects;
CREATE POLICY "Only Owner and Admin can upload to media and branding buckets"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id IN ('media', 'branding', 'products') AND
        public.current_user_role() IN ('owner', 'admin')
    );

DROP POLICY IF EXISTS "Only Owner and Admin can delete from media buckets" ON storage.objects;
CREATE POLICY "Only Owner and Admin can delete from media buckets"
    ON storage.objects FOR DELETE
    USING (
        bucket_id IN ('media', 'branding', 'products') AND
        public.current_user_role() IN ('owner', 'admin')
    );

-- 10. Ensure the primary store account has role = 'owner'
UPDATE public.profiles
SET role = 'owner'
WHERE email = 'desifusionbites@gmail.com' OR role IS NULL OR role = '';
