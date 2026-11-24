import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumFooter } from "@/components/PremiumFooter";
import { Suspense } from "react";
import { TopRouteProgressBar } from "@/components/ui/TopRouteProgressBar";
import { CartProvider } from "@/context/CartContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SiteSettingsService } from "@/services/SiteSettingsService";
import { getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const viewport: Viewport = {
  themeColor: "#18181B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Green Steel Furniture — Modern Showroom Collection",
  description:
    "Architectural steel furniture designed for refined contemporary interiors. Natural finishes, seamless craftsmanship, and timeless spaces.",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
  },
  openGraph: {
    title: "Green Steel Furniture — Pure Steel. Perfected for Home.",
    description:
      "Pure heavy-gauge steel architectural furniture engineered for generations. Handcrafted in Gorakhpur with a 15-year warranty.",
    url: getSiteUrl(),
    siteName: "Green Steel Furniture",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Green Steel Furniture",
        type: "image/jpeg",
      },
      {
        url: "/og-banner.png",
        width: 1080,
        height: 609,
        alt: "Green Steel Furniture",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Green Steel Furniture — Pure Steel. Perfected for Home.",
    description:
      "Pure heavy-gauge steel architectural furniture engineered for generations. Handcrafted in Gorakhpur.",
    images: ["/og-banner.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await SiteSettingsService.getSiteSettings();

  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="min-h-screen bg-[#FAF8F5] text-[#18181B] antialiased font-sans selection:bg-[#18181B] selection:text-[#FAF8F5] flex flex-col justify-between">
        <SiteSettingsProvider settings={settings}>
          <CartProvider>
            <Suspense fallback={null}>
              <TopRouteProgressBar />
            </Suspense>
            <PremiumHeader />
            <div className="flex-grow w-full">{children}</div>
            <PremiumFooter settings={settings} />
            <CartDrawer />
          </CartProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
