-- ============================================================================
-- Green Steel Furniture — RBAC & Admin Authentication Schema
-- Migration: 002_admin_auth.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADMIN USERS TABLE (Linked to auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. HELPER FUNCTION: is_admin()
-- Evaluates with SECURITY DEFINER to avoid recursive RLS checks
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid()
    );
$$;

-- ----------------------------------------------------------------------------
-- 3. ENABLE RLS ON ALL CORE TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 4. CLEAN UP LEGACY POLICIES (if present)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can read active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins have full access to categories" ON public.categories;

DROP POLICY IF EXISTS "Public can read active products" ON public.products;
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;

DROP POLICY IF EXISTS "Public can read finishes" ON public.product_finishes;
DROP POLICY IF EXISTS "Admins have full access to product_finishes" ON public.product_finishes;

DROP POLICY IF EXISTS "Public can read sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Admins have full access to product_sizes" ON public.product_sizes;

DROP POLICY IF EXISTS "Public can read active storefront sections" ON public.storefront_sections;
DROP POLICY IF EXISTS "Admins have full access to storefront_sections" ON public.storefront_sections;

DROP POLICY IF EXISTS "Admins have full access to bookings" ON public.bookings;

-- ----------------------------------------------------------------------------
-- 5. READ POLICIES (Public Storefront Access)
-- ----------------------------------------------------------------------------
CREATE POLICY "Public can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Public can view products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Public can view product finishes" ON public.product_finishes
    FOR SELECT USING (true);

CREATE POLICY "Public can view product sizes" ON public.product_sizes
    FOR SELECT USING (true);

CREATE POLICY "Public can view storefront sections" ON public.storefront_sections
    FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- 6. MUTATION POLICIES (Strict RBAC: Only if auth.uid() in admin_users)
-- ----------------------------------------------------------------------------
-- Categories Mutations
CREATE POLICY "Admins can insert categories" ON public.categories
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories" ON public.categories
    FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete categories" ON public.categories
    FOR DELETE USING (public.is_admin());

-- Products Mutations
CREATE POLICY "Admins can insert products" ON public.products
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products" ON public.products
    FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products" ON public.products
    FOR DELETE USING (public.is_admin());

-- Product Finishes Mutations
CREATE POLICY "Admins can insert finishes" ON public.product_finishes
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update finishes" ON public.product_finishes
    FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete finishes" ON public.product_finishes
    FOR DELETE USING (public.is_admin());

-- Product Sizes Mutations
CREATE POLICY "Admins can insert sizes" ON public.product_sizes
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update sizes" ON public.product_sizes
    FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete sizes" ON public.product_sizes
    FOR DELETE USING (public.is_admin());

-- Storefront Sections Mutations
CREATE POLICY "Admins can insert storefront sections" ON public.storefront_sections
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update storefront sections" ON public.storefront_sections
    FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete storefront sections" ON public.storefront_sections
    FOR DELETE USING (public.is_admin());

-- Bookings Admin Management (Public insert already handled in 001)
CREATE POLICY "Admins can view and update bookings" ON public.bookings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Admin Users Table Policy
DROP POLICY IF EXISTS "Admins can read admin_users" ON public.admin_users;
CREATE POLICY "Allow authenticated read on admin_users" ON public.admin_users
    FOR SELECT TO authenticated
    USING (id = auth.uid() OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. STORAGE POLICIES FOR FURNITURE MEDIA
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can upload furniture media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update furniture media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete furniture media" ON storage.objects;

CREATE POLICY "Admins can upload furniture media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'furniture-media' AND public.is_admin());

CREATE POLICY "Admins can update furniture media" ON storage.objects
    FOR UPDATE USING (bucket_id = 'furniture-media' AND public.is_admin());

CREATE POLICY "Admins can delete furniture media" ON storage.objects
    FOR DELETE USING (bucket_id = 'furniture-media' AND public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. GRANT API PERMISSIONS TO ROLES
-- ----------------------------------------------------------------------------
GRANT ALL ON TABLE public.admin_users TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
