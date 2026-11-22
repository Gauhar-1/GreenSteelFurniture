/**
 * Resolves the canonical site base URL for absolute metadata, OG images, and WhatsApp links.
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (e.g., https://greensteelfurniture.com)
 * 2. window.location.origin (when running on browser client)
 * 3. Vercel deployment URL (process.env.VERCEL_URL)
 * 4. Fallback to http://localhost:3000
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

