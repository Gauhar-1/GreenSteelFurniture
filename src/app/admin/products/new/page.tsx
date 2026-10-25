import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ProductWizard } from "@/components/admin/ProductWizard";
import { ChevronLeft } from "lucide-react";
import { CategoryService } from "@/services/CategoryService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Furniture Wizard | Admin Studio",
  description: "3-Step visual product creator with smart dimensions and flexible photo uploads.",
};

export default async function NewProductBlueprintPage() {
  const categories = await CategoryService.getAllCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#71717A] hover:text-[#18181B] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>

        <span className="text-[11px] font-mono text-[#71717A]">
          Connected to Supabase Database
        </span>
      </div>

      <ProductWizard categories={categories} />
    </div>
  );
}

