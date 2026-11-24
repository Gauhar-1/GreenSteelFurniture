-- ============================================================================
-- Green Steel Furniture — Parametric SVG Blueprint Type Migration
-- Migration: 008_product_blueprint_type.sql
-- ============================================================================

-- Add blueprint_type archetype directly to products table for true-to-life architectural scale rendering
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS blueprint_type TEXT DEFAULT NULL;

COMMENT ON COLUMN public.products.blueprint_type IS
  'Parametric SVG blueprint archetype: wardrobe | bed | dining_table | jhula | sofa | desk | chair | generic_box';

