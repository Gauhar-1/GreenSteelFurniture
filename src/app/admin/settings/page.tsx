import { Metadata } from "next";
import { SiteSettingsService } from "@/services/SiteSettingsService";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export const metadata: Metadata = {
  title: "Site Settings Studio | Green Steel Admin",
  description: "Configure brand identity, hotlines, factory locations, delivery districts, and footer narratives.",
};

export default async function AdminSettingsPage() {
  const settings = await SiteSettingsService.getSiteSettings();

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      <SiteSettingsForm initialSettings={settings} />
    </div>
  );
}

