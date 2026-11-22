/**
 * Resolves the canonical site base URL for absolute metadata, OG images, and WhatsApp links.
 * Priority:
 * 1. window.location.origin (when running on browser client)
 * 2. NEXT_PUBLIC_SITE_URL (e.g., https://greensteelfurniture.com)
 * 3. Vercel deployment URL (process.env.VERCEL_URL)
 * 4. Fallback to http://localhost:3000
 */
export function getSiteUrl(): string {
  // Client-side fallback ensures WhatsApp links are always absolute and valid in local dev or production
  if (typeof window !== "undefined" && window.location?.origin) {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("example.com")) {
      return envUrl.replace(/\/+$/, "");
    }
    return window.location.origin.replace(/\/+$/, "");
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}
