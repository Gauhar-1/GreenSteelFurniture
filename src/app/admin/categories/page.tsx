import React from "react";
import { Metadata } from "next";
import { CategoryService } from "@/services/CategoryService";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const metadata: Metadata = {
  title: "Categories & Rooms | Admin Studio",
  description: "Manage showroom departments, sub-categories, and spatial blueprint types.",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await CategoryService.getAllCategories();

  return (
    <div className="space-y-6">
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
