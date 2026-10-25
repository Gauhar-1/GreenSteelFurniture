import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductWizard } from "@/components/admin/ProductWizard";
import { ChevronLeft } from "lucide-react";
import { CategoryService } from "@/services/CategoryService";
import { ProductService } from "@/services/ProductService";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await ProductService.getProductById(id);

  return {
    title: product
      ? `Edit ${product.title_en} | Admin Studio`
      : "Edit Furniture | Admin Studio",
    description: "Update pure steel furniture specifications, color finishes, and sizes.",
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  // Fetch product from Supabase Service Layer
  const product = await ProductService.getProductById(id);
  if (!product) {
    notFound();
  }

  // Fetch all verified categories
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
          Editing ID: <strong className="text-[#18181B]">{product.id.slice(0, 8)}...</strong>
        </span>
      </div>

      <ProductWizard categories={categories} initialData={product} />
    </div>
  );
}
