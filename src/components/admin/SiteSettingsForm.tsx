"use client";

import React, { useState, useTransition } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Globe,
  Share2,
  Plus,
  X,
  Check,
  Building,
  Factory,
  Sparkles,
  Eye,
  Save,
} from "lucide-react";
import type { SiteSettings } from "@/types/database";
import { updateSiteSettingsAction } from "@/actions/siteSettingsActions";
import { cn } from "@/lib/utils";

interface SiteSettingsFormProps {
  initialSettings: SiteSettings;
}

export function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [newDistrict, setNewDistrict] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ success: boolean; message: string } | null>(null);

  const showToast = (success: boolean, message: string) => {
    setToast({ success, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddDistrict = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newDistrict.trim();
    if (!trimmed) return;
    if (settings.service_districts.includes(trimmed)) {
      showToast(false, `"${trimmed}" is already in the service districts.`);
      return;
    }
    setSettings((prev) => ({
      ...prev,
      service_districts: [...prev.service_districts, trimmed],
    }));
    setNewDistrict("");
  };

  const handleRemoveDistrict = (districtToRemove: string) => {
    setSettings((prev) => ({
      ...prev,
      service_districts: prev.service_districts.filter((d) => d !== districtToRemove),
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateSiteSettingsAction(settings);
      if (res.success) {
        showToast(true, "Site settings saved and storefront footer revalidated!");
      } else {
        showToast(false, res.message || "Failed to save site settings.");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-20 md:bottom-8 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-3",
            toast.success
              ? "bg-[#18181B] text-[#FAF8F5] border border-emerald-500/30"
              : "bg-red-950 text-red-100 border border-red-500/40"
          )}
        >
          {toast.success ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <X className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#18181B]/10 shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#71717A]">
            Global Operations Studio
          </span>
          <h2 className="text-xl font-serif font-bold text-[#18181B] tracking-tight">
            Storefront & Contact Architecture
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            Configure contact hotlines, showroom GPS coords, operating districts, and footer narratives.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
        >
          {isPending ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Publish</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Inputs (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Contact Concierge */}
          <div className="bg-white p-6 rounded-2xl border border-[#18181B]/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#18181B]/5">
              <Phone className="w-4 h-4 text-[#9A3412]" />
              <h3 className="text-sm font-semibold text-[#18181B] uppercase tracking-wider">
                1. Concierge & Hotlines
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1">
                  Brand Display Name
                </label>
                <input
                  type="text"
                  value={settings.brand_name}
                  onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none transition-colors"
                  placeholder="Green Steel Furniture"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1">
                    Primary Hotline / Call
                  </label>
                  <input
                    type="text"
                    value={settings.phone_primary}
                    onChange={(e) => setSettings({ ...settings, phone_primary: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1">
                    WhatsApp Concierge (Digits Only)
                  </label>
                  <input
                    type="text"
                    value={settings.whatsapp_number}
                    onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none transition-colors font-mono"
                    placeholder="919876543210"
                  />
                  <p className="text-[10px] text-[#71717A] mt-1">Country code + 10 digits without symbols.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1">
                    Concierge Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none transition-colors"
                    placeholder="concierge@greensteelfurniture.com"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1">
                    Studio Operating Hours
                  </label>
                  <input
                    type="text"
                    value={settings.operating_hours}
                    onChange={(e) => setSettings({ ...settings, operating_hours: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none transition-colors"
                    placeholder="Mon–Sat, 9:30 AM – 8:00 PM"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Studio & Factory Addresses */}
          <div className="bg-white p-6 rounded-2xl border border-[#18181B]/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#18181B]/5">
              <Building className="w-4 h-4 text-[#9A3412]" />
              <h3 className="text-sm font-semibold text-[#18181B] uppercase tracking-wider">
                2. Showroom, Factory & Directions
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1">
                  Flagship Design Studio Address
                </label>
                <textarea
                  rows={2}
                  value={settings.showroom_address}
                  onChange={(e) => setSettings({ ...settings, showroom_address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none transition-colors resize-none"
                  placeholder="NH-28 Industrial Corridor, Gorakhpur, UP 273001"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1">
                  Factory & Industrial Manufacturing Address
                </label>
                <textarea
                  rows={2}
                  value={settings.factory_address}
                  onChange={(e) => setSettings({ ...settings, factory_address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none transition-colors resize-none"
                  placeholder="Plot 14-16, Phase II Industrial Estate, Gorakhpur, UP 273001"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1">
                  Google Maps Location Link
                </label>
                <input
                  type="url"
                  value={settings.google_maps_url}
                  onChange={(e) => setSettings({ ...settings, google_maps_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none transition-colors font-mono"
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Districts Chip Builder */}
          <div className="bg-white p-6 rounded-2xl border border-[#18181B]/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#18181B]/5">
              <MapPin className="w-4 h-4 text-[#9A3412]" />
              <h3 className="text-sm font-semibold text-[#18181B] uppercase tracking-wider">
                3. Operating & Delivery Districts ({settings.service_districts.length})
              </h3>
            </div>

            <p className="text-xs text-[#71717A]">
              Add target cities and districts where Green Steel provides direct white-glove delivery and assembly.
            </p>

            <form onSubmit={handleAddDistrict} className="flex gap-2">
              <input
                type="text"
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                placeholder="e.g. Kushinagar, Lucknow, Patna..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none text-xs transition-colors"
              />
              <button
                type="button"
                onClick={() => handleAddDistrict()}
                className="px-4 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#9A3412] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add District</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {settings.service_districts.map((district) => (
                <span
                  key={district}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] text-[#18181B] border border-[#18181B]/15 text-xs font-medium group transition-all"
                >
                  <span>{district}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDistrict(district)}
                    className="text-[#71717A] hover:text-red-600 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-red-50"
                    title={`Remove ${district}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {settings.service_districts.length === 0 && (
                <p className="text-xs text-amber-700 italic">No districts added yet.</p>
              )}
            </div>
          </div>

          {/* Section 4: Footer Narrative & Socials */}
          <div className="bg-white p-6 rounded-2xl border border-[#18181B]/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#18181B]/5">
              <Share2 className="w-4 h-4 text-[#9A3412]" />
              <h3 className="text-sm font-semibold text-[#18181B] uppercase tracking-wider">
                4. Footer Story & Social Handles
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1">
                  Footer Brand Tagline
                </label>
                <textarea
                  rows={2}
                  value={settings.footer_tagline}
                  onChange={(e) => setSettings({ ...settings, footer_tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none transition-colors resize-none"
                  placeholder="Pure heavy-gauge steel furniture engineered for generations..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={settings.social_links?.instagram || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_links: { ...settings.social_links, instagram: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none transition-colors font-mono text-[11px]"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={settings.social_links?.facebook || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_links: { ...settings.social_links, facebook: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none transition-colors font-mono text-[11px]"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#71717A] uppercase tracking-wider mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={settings.social_links?.youtube || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_links: { ...settings.social_links, youtube: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#18181B]/15 bg-[#FAF8F5]/50 focus:bg-white focus:border-[#18181B] focus:outline-none transition-colors font-mono text-[11px]"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Card (Right 5 Cols, Sticky) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-[#18181B] text-[#FAF8F5] p-6 rounded-2xl border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-serif font-bold tracking-wider uppercase text-white">
                  Live Footer Preview
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#FAF8F5]/70">
                Synchronous
              </span>
            </div>

            {/* Brand Title & Tagline */}
            <div>
              <span className="font-serif text-base tracking-[0.25em] uppercase font-bold text-white block">
                {settings.brand_name || "GREEN STEEL"}
              </span>
              <p className="text-xs font-light text-[#FAF8F5]/80 leading-relaxed mt-2 line-clamp-3">
                {settings.footer_tagline || "Pure heavy-gauge steel furniture engineered for generations."}
              </p>
            </div>

            {/* Flagship Showroom & Hours */}
            <div className="space-y-2.5 text-xs text-[#FAF8F5]/75 border-t border-white/10 pt-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Showroom Studio</p>
                  <p className="text-[11px] leading-tight text-[#FAF8F5]/70 mt-0.5">
                    {settings.showroom_address || "NH-28 Corridor, Gorakhpur"}
                  </p>
                </div>
              </div>

              {settings.factory_address && (
                <div className="flex items-start gap-2">
                  <Factory className="w-3.5 h-3.5 text-[#FAF8F5]/40 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white/90">Factory Works</p>
                    <p className="text-[11px] leading-tight text-[#FAF8F5]/60 mt-0.5">
                      {settings.factory_address}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#FAF8F5]/40 shrink-0" />
                <span className="text-[11px] text-[#FAF8F5]/70">
                  {settings.operating_hours || "Mon–Sat: 9:30 AM – 8:00 PM"}
                </span>
              </div>
            </div>

            {/* Direct Hotlines */}
            <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#FAF8F5]/60">Call Us</span>
                <span className="font-mono font-medium text-white">{settings.phone_primary}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#FAF8F5]/60">WhatsApp</span>
                <span className="font-mono font-medium text-emerald-400">+{settings.whatsapp_number}</span>
              </div>
              {settings.email && (
                <div className="flex items-center justify-between">
                  <span className="text-[#FAF8F5]/60">Email</span>
                  <span className="font-sans text-[11px] text-white/80">{settings.email}</span>
                </div>
              )}
            </div>

            {/* Delivering Across Chips */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-[10px] uppercase font-mono tracking-wider text-[#FAF8F5]/50 mb-2">
                Direct Delivery In {settings.service_districts.length} Regions:
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {settings.service_districts.slice(0, 10).map((district) => (
                  <span
                    key={district}
                    className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-white/90 font-medium"
                  >
                    {district}
                  </span>
                ))}
                {settings.service_districts.length > 10 && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/50">
                    +{settings.service_districts.length - 10} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

