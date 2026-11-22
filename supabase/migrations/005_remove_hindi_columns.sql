-- ============================================================================
-- Green Steel Furniture — Migration 005: Remove Hindi Localization Columns
-- ============================================================================

-- Safely drop Hindi localization columns without breaking existing data rows
ALTER TABLE public.categories DROP COLUMN IF EXISTS name_hi;
ALTER TABLE public.products DROP COLUMN IF EXISTS title_hi;
ALTER TABLE public.storefront_sections DROP COLUMN IF EXISTS title_hi;

