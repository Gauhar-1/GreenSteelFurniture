import { Metadata } from "next";
import { ReviewService } from "@/services/ReviewService";
import { SiteSettingsService } from "@/services/SiteSettingsService";
import { ReviewsClientView } from "@/components/reviews/ReviewsClientView";

export const revalidate = 60; // ISR cache revalidation every minute

export const metadata: Metadata = {
  title: "Client Work & Commissioned Projects | Green Steel Furniture",
  description:
    "Explore verified steel furniture installations for private homeowners and commercial spaces across Uttar Pradesh & Bihar. Zero termite risk, heavy-gauge steel craftsmanship.",
  openGraph: {
    title: "Client Work & Commissioned Projects | Green Steel Furniture",
    description:
      "Explore real homeowner reviews and commercial institutional steel installations.",
  },
};

export default async function ReviewsPage() {
  const [reviews, settings] = await Promise.all([
    ReviewService.getActiveReviews(),
    SiteSettingsService.getSiteSettings(),
  ]);

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      <ReviewsClientView initialReviews={reviews} settings={settings} />
    </main>
  );
}

