import React, { Suspense } from "react";
import { Metadata } from "next";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Studio Login | Green Steel Furniture",
  description: "Secure administrator authentication and RBAC portal for Green Steel Furniture.",
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#9A3412] animate-spin" />
        </div>
      }
    >
      <AdminLogin />
    </Suspense>
  );
}
