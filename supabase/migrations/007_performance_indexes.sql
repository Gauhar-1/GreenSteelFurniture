-- Migration 007: Performance Optimization Indexes
-- Aligns with Phase 2 Audit to eliminate table scans on product relations and storefront ordering

-- 1. Index products by subcategory
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(sub_category_id);

-- 2. Index product finishes by product_id
CREATE INDEX IF NOT EXISTS idx_product_finishes_product ON public.product_finishes(product_id);

-- 3. Index product sizes by product_id
CREATE INDEX IF NOT EXISTS idx_product_sizes_product ON public.product_sizes(product_id);

-- 4. Index storefront sections by active status and display order
CREATE INDEX IF NOT EXISTS idx_storefront_active_order ON public.storefront_sections(is_active, display_order);

-- 5. Index categories by active status and display order
CREATE INDEX IF NOT EXISTS idx_categories_active_display ON public.categories(is_active, display_order);

