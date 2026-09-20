-- ========================================================================
-- DESI FUSION BITES - REAL BUSINESS SEED DATA (00003)
-- Seeds only verified business credentials and initial section layout.
-- DOES NOT invent fake products, categories, or testimonials.
-- ========================================================================

-- Insert verified initial business settings
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
    'Packaged Food & Traditional Snacks',
    'Purana Swad, Naya Tadka',
    'Authentic Indian tastes blended with contemporary quality standards. Freshly prepared, hygienically packed, and delivered with care.',
    'Explore Products',
    '/products',
    'About Desi Fusion Bites',
    '["Desi Fusion Bites is dedicated to bringing authentic, rich Indian taste with a touch of modern refinement.", "Under the supervision of our proprietor Aruna Harlalka and team, our packaged foods are crafted with quality ingredients, pure spices, and uncompromising hygiene (FSSAI Lic. No. 12826999000591)."]'::jsonb,
    'Authentic Indian packaged food and snack delights.'
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

-- Insert default homepage sections configuration
INSERT INTO public.website_sections (id, name, display_order, is_enabled, title, subtitle)
VALUES 
    ('hero', 'Hero Banner', 1, true, 'Purana Swad, Naya Tadka', 'Authentic Indian Packaged Foods'),
    ('categories', 'Product Categories', 2, true, 'Explore by Category', 'Browse our curated ranges of traditional and fusion treats'),
    ('featured_products', 'Featured Products', 3, true, 'Our Featured Bites', 'Handpicked favourites prepared with premium ingredients'),
    ('story_preview', 'Brand Story Preview', 4, true, 'Our Heritage & Tradition', 'The story behind Desi Fusion Bites'),
    ('wholesale_cta', 'Wholesale & Distributor Banner', 5, true, 'Partner With Desi Fusion Bites', 'Special pricing and bulk supply for distributors, retailers, and resellers'),
    ('testimonials', 'Customer Testimonials', 6, true, 'What Our Customers Say', 'Real feedback from patrons across India'),
    ('contact_preview', 'Visit & Contact Us', 7, true, 'Get In Touch', 'Located in Hooghly District, West Bengal. We ship nationwide.')
ON CONFLICT (id) DO NOTHING;
