-- ========================================================================
-- DESI FUSION BITES - DELIVERY & SHIPPING SETTINGS (00008)
-- Adds configurable delivery fee and manual free delivery toggle
-- ========================================================================

ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) DEFAULT 60.00;

ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS free_delivery_enabled BOOLEAN DEFAULT false;

ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS free_delivery_min_amount NUMERIC(10, 2) DEFAULT NULL;
