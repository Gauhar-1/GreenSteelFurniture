-- Migration 003: Add display_order column to storefront_sections table
ALTER TABLE public.storefront_sections 
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_storefront_sections_display_order 
ON public.storefront_sections(display_order);
