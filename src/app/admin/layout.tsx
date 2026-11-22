import React from "react";
import type { Metadata, Viewport } from "next";
import { AdminStudioShell } from "@/components/admin/AdminStudioShell";

export const metadata: Metadata = {
  title: "Green Steel Studio",
  description: "Inventory & Storefront Management for Green Steel Furniture",
  manifest: "/admin-manifest.json",
  appleWebApp: {
    capable: true,
    title: "GS Studio",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/admin-icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#18181B",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminStudioShell>{children}</AdminStudioShell>;
}
