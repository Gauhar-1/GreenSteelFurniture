"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { SiteSettings } from "@/types/database";
import { DEFAULT_SITE_SETTINGS } from "@/types/database";

export interface SiteSettingsContextValue {
  settings: SiteSettings;
  whatsappPhone: string;
  businessPhone: string;
  whatsappUrl: (message?: string) => string;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: DEFAULT_SITE_SETTINGS,
  whatsappPhone: "919876543210",
  businessPhone: "+91 98765 43210",
  whatsappUrl: (msg) =>
    `https://wa.me/919876543210?text=${encodeURIComponent(
      msg || "Namaste! I would like to consult with Green Steel Furniture."
    )}`,
});

export function SiteSettingsProvider({
  children,
  settings = DEFAULT_SITE_SETTINGS,
}: {
  children: React.ReactNode;
  settings?: SiteSettings;
}) {
  const value = useMemo(() => {
    const rawSettings = settings || DEFAULT_SITE_SETTINGS;

    // 1. Local environment override for developer testing
    const envWa = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.trim();
    const envBiz = process.env.NEXT_PUBLIC_BUSINESS_PHONE?.trim();

    // 2. Production fallback: use admin panel settings from site_settings table
    const effectiveWa =
      envWa && envWa.length > 0
        ? envWa.replace(/[^0-9]/g, "")
        : (rawSettings.whatsapp_number || "919876543210").replace(/[^0-9]/g, "");

    const effectiveBiz =
      envBiz && envBiz.length > 0
        ? envBiz
        : rawSettings.phone_primary || `+${effectiveWa}`;

    const buildWaUrl = (message?: string) => {
      const text =
        message || "Namaste! I would like to consult with Green Steel Furniture.";
      return `https://wa.me/${effectiveWa}?text=${encodeURIComponent(text)}`;
    };

    return {
      settings: rawSettings,
      whatsappPhone: effectiveWa,
      businessPhone: effectiveBiz,
      whatsappUrl: buildWaUrl,
    };
  }, [settings]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

