-- ========================================================================
-- DESI FUSION BITES - REAL BUSINESS SEED DATA (00003)
-- Seeds only verified business credentials and initial neutral layout.
-- DOES NOT invent unverified marketing claims, products, categories, or testimonials.
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

-- Insert default homepage sections configuration
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
