-- ============================================================================
-- Green Steel Furniture — Phase 1 Security & RLS Hardening
-- Migration: 004_security_rls_hardening.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HARDEN PUBLIC SELECT POLICIES (Hide draft/inactive items from public)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Public can view storefront sections" ON public.storefront_sections;
CREATE POLICY "Public can view active storefront sections" ON public.storefront_sections
    FOR SELECT USING (is_active = true OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. LOCK DOWN BOOKINGS TABLE (Eliminate public write & read surface)
-- In the WhatsApp inquiry model, bookings is admin-only.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can read bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view and update bookings" ON public.bookings;

-- Only authenticated admins have access to bookings
CREATE POLICY "Admins have exclusive access to bookings" ON public.bookings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. STORAGE POLICIES (furniture-media: Public SELECT, Admin-only mutations)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view furniture media" ON storage.objects;
CREATE POLICY "Public can view furniture media" ON storage.objects
    FOR SELECT USING (bucket_id = 'furniture-media');

DROP POLICY IF EXISTS "Admins can upload furniture media" ON storage.objects;
CREATE POLICY "Admins can upload furniture media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'furniture-media' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update furniture media" ON storage.objects;
CREATE POLICY "Admins can update furniture media" ON storage.objects
    FOR UPDATE USING (bucket_id = 'furniture-media' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete furniture media" ON storage.objects;
CREATE POLICY "Admins can delete furniture media" ON storage.objects
    FOR DELETE USING (bucket_id = 'furniture-media' AND public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. PERFORMANCE & FOREIGN KEY INDEXES
-- ----------------------------------------------------------------------------
-- Ensure display_order column exists on storefront_sections before creating composite index
ALTER TABLE public.storefront_sections 
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_product_finishes_product_id ON public.product_finishes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON public.product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_storefront_sections_active_order ON public.storefront_sections(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created ON public.bookings(order_status, created_at);

