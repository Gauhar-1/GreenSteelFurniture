-- ============================================================================
-- Green Steel Furniture — Production Supabase Schema
-- Migration: 001_production_schema.sql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. CATEGORIES TABLE
-- Supports multi-tier hierarchy (Departments -> Sub-categories)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name_en TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    blueprint_type TEXT NOT NULL CHECK (blueprint_type IN ('wardrobe', 'bed', 'seating', 'table', 'storage')),
    cover_image TEXT NOT NULL,
    subtitle TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_display ON public.categories(display_order);

-- ----------------------------------------------------------------------------
-- 2. PRODUCTS TABLE (Master Blueprint)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    sub_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title_en TEXT NOT NULL,
    title_hi TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price > 0),
    highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;

-- ----------------------------------------------------------------------------
-- 3. PRODUCT FINISHES TABLE (4-Photo Architecture)
-- exact keys in media JSONB: lifestyle, front, functional, macro
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_finishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    finish_name TEXT NOT NULL,
    hex_code TEXT NOT NULL,
    media JSONB NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_media_slots CHECK (
        media ? 'lifestyle' AND
        media ? 'front' AND
        media ? 'functional' AND
        media ? 'macro'
    )
);

CREATE INDEX IF NOT EXISTS idx_product_finishes_product ON public.product_finishes(product_id);

-- ----------------------------------------------------------------------------
-- 4. PRODUCT SIZES TABLE (Smart Dimensions)
-- dimensions JSONB driven by blueprint_type
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size_label TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    token_amount NUMERIC(10, 2) NOT NULL DEFAULT 999.00 CHECK (token_amount > 0),
    dimensions JSONB NOT NULL,
    stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'made_to_order')),
    delivery_days INTEGER NOT NULL DEFAULT 7 CHECK (delivery_days >= 1),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_sizes_product ON public.product_sizes(product_id);

-- ----------------------------------------------------------------------------
-- 5. STOREFRONT SECTIONS TABLE (Dynamic Editorial CMS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.storefront_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL UNIQUE,
    title_en TEXT NOT NULL,
    title_hi TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_storefront_sections_key ON public.storefront_sections(section_key);

-- ----------------------------------------------------------------------------
-- 6. BOOKINGS TABLE (Token Advance Orders)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    finish_id UUID NOT NULL REFERENCES public.product_finishes(id) ON DELETE RESTRICT,
    size_id UUID NOT NULL REFERENCES public.product_sizes(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    pincode TEXT NOT NULL,
    city_district TEXT NOT NULL,
    payment_mode TEXT NOT NULL DEFAULT 'token_advance' CHECK (payment_mode IN ('token_advance', 'full_prepaid', 'cod')),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount > 0),
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    order_status TEXT NOT NULL DEFAULT 'pending_token' CHECK (
        order_status IN ('pending_token', 'confirmed', 'in_production', 'dispatched', 'delivered', 'cancelled')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_phone ON public.bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(order_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON public.bookings(created_at DESC);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Public can read active catalog records
CREATE POLICY "Public can read active categories" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read finishes" ON public.product_finishes
    FOR SELECT USING (true);

CREATE POLICY "Public can read sizes" ON public.product_sizes
    FOR SELECT USING (true);

CREATE POLICY "Public can read active storefront sections" ON public.storefront_sections
    FOR SELECT USING (is_active = true);

-- Public can insert new customer bookings
CREATE POLICY "Public can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- Authenticated admins have full CRUD access
CREATE POLICY "Admins have full access to categories" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to products" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to product_finishes" ON public.product_finishes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to product_sizes" ON public.product_sizes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to storefront_sections" ON public.storefront_sections
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to bookings" ON public.bookings
    FOR ALL USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- STORAGE BUCKET CREATION (furniture-media)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('furniture-media', 'furniture-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view furniture media" ON storage.objects
    FOR SELECT USING (bucket_id = 'furniture-media');

CREATE POLICY "Authenticated users can upload furniture media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'furniture-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update furniture media" ON storage.objects
    FOR UPDATE USING (bucket_id = 'furniture-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete furniture media" ON storage.objects
    FOR DELETE USING (bucket_id = 'furniture-media' AND auth.role() = 'authenticated');
