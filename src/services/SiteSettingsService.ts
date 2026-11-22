import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LocalDataStore } from "@/services/LocalDataStore";
import { type SiteSettings, SiteSettingsSchema, DEFAULT_SITE_SETTINGS } from "@/types/database";

export { DEFAULT_SITE_SETTINGS };

export class SiteSettingsService {
  private static isConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes("placeholder-project"));
  }

  /**
   * Retrieves singleton site settings with React cache() deduplication.
   * Cookie-free public query. Falls back gracefully to LocalDataStore/defaults.
   */
  public static getSiteSettings = cache(async (): Promise<SiteSettings> => {
    try {
      if (!SiteSettingsService.isConfigured()) {
        return LocalDataStore.getSiteSettings();
      }

      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      if (error || !data) {
        return LocalDataStore.getSiteSettings();
      }

      const parsed = SiteSettingsSchema.safeParse(data);
      if (parsed.success) {
        return parsed.data;
      }

      return LocalDataStore.getSiteSettings();
    } catch {
      return LocalDataStore.getSiteSettings();
    }
  });
}

