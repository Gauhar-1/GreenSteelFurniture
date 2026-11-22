-- ============================================================================
-- Green Steel Furniture — Site Settings & Client Reviews Showcase
-- Migration: 006_site_settings_and_reviews.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SITE SETTINGS TABLE (Singleton row: id = 'global')
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'global' CHECK (id = 'global'),
    brand_name TEXT NOT NULL DEFAULT 'Green Steel Furniture',
    footer_tagline TEXT DEFAULT 'Pure heavy-gauge steel furniture engineered for generations. Handcrafted in our Gorakhpur industrial studio.',
    phone_primary TEXT DEFAULT '+91 98765 43210',
    whatsapp_number TEXT DEFAULT '919876543210',
    email TEXT DEFAULT 'concierge@greensteelfurniture.com',
    showroom_address TEXT DEFAULT 'NH-28 Industrial Corridor, Showroom & Design Studio, Gorakhpur, Uttar Pradesh 273001',
    factory_address TEXT DEFAULT 'Plot 14-16, Phase II Industrial Estate, Gorakhpur, UP 273001',
    google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Gorakhpur+Industrial+Area',
    operating_hours TEXT DEFAULT 'Mon–Sat, 9:30 AM – 8:00 PM',
    service_districts TEXT[] NOT NULL DEFAULT ARRAY['Gorakhpur', 'Lucknow', 'Varanasi', 'Ayodhya', 'Basti', 'Deoria', 'Kushinagar', 'Azamgarh', 'Mau', 'Ballia'],
    social_links JSONB NOT NULL DEFAULT '{"instagram": "https://instagram.com/greensteelfurniture", "facebook": "https://facebook.com/greensteelfurniture", "youtube": ""}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed singleton row if not exists
INSERT INTO public.site_settings (id)
VALUES ('global')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read site settings
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
    FOR SELECT USING (true);

-- Admins can update site settings
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" ON public.site_settings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Table-level grants for Supabase roles
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO authenticated, service_role;


-- ----------------------------------------------------------------------------
-- 2. CLIENT REVIEWS & B2B/D2C PORTFOLIO TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_type VARCHAR(10) NOT NULL CHECK (client_type IN ('D2C', 'B2B')),
    client_name VARCHAR(255) NOT NULL,
    company_or_location VARCHAR(255) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    review_text TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    linked_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_client_reviews_active_type 
    ON public.client_reviews(is_active, client_type, display_order);

CREATE INDEX IF NOT EXISTS idx_client_reviews_featured 
    ON public.client_reviews(is_active, is_featured);

CREATE INDEX IF NOT EXISTS idx_client_reviews_product 
    ON public.client_reviews(linked_product_id);

-- Enable RLS
ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;

-- Public can view active reviews; admins can view all
DROP POLICY IF EXISTS "Public can view active client reviews" ON public.client_reviews;
CREATE POLICY "Public can view active client reviews" ON public.client_reviews
    FOR SELECT USING (is_active = true OR public.is_admin());

-- Admins can perform all mutations
DROP POLICY IF EXISTS "Admins can manage client reviews" ON public.client_reviews;
CREATE POLICY "Admins can manage client reviews" ON public.client_reviews
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Table-level grants for Supabase roles
GRANT SELECT ON public.client_reviews TO anon, authenticated;
GRANT ALL ON public.client_reviews TO authenticated, service_role;

