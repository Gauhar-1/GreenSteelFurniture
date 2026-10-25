import React from "react";
import { Metadata } from "next";
import { ProductService } from "@/services/ProductService";
import { ProductCatalogList } from "@/components/admin/ProductCatalogList";

export const metadata: Metadata = {
  title: "Furniture Catalog | Admin Studio",
  description: "Manage pure steel furniture blueprints, color finishes, and sizes.",
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await ProductService.getProducts();

  return (
    <div className="space-y-6">
      <ProductCatalogList initialProducts={products} />
    </div>
  );
}
