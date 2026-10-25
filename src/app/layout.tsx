import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { PremiumHeader } from "@/components/PremiumHeader";
import { PremiumFooter } from "@/components/PremiumFooter";
import { Suspense } from "react";
import { TopRouteProgressBar } from "@/components/ui/TopRouteProgressBar";
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
  title: "Green Steel Furniture — Modern Showroom Collection",
  description:
    "Architectural steel furniture designed for refined contemporary interiors. Natural finishes, seamless craftsmanship, and timeless spaces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="min-h-screen bg-[#FAF8F5] text-[#18181B] antialiased font-sans selection:bg-[#18181B] selection:text-[#FAF8F5] flex flex-col justify-between">
        <Suspense fallback={null}>
          <TopRouteProgressBar />
        </Suspense>
        <PremiumHeader />
        <div className="flex-grow w-full">{children}</div>
        <PremiumFooter />
      </body>
    </html>
  );
}
