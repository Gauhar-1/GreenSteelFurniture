import { ImageResponse } from "next/og";
import { ProductService } from "@/services/ProductService";
import { getSiteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

interface ProductOgImageProps {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
}

/**
 * Dynamic Product OpenGraph Banner
 * Route: /categories/[slug]/product/[productSlug]/opengraph-image
 * Generates an automated 1200x630 luxury marketing card for WhatsApp and social previews.
 */
export default async function ProductOpenGraphImage({
  params,
}: ProductOgImageProps) {
  const { productSlug } = await params;
  const product = await ProductService.getProductBySlug(productSlug).catch(() => null);

  const title = product?.title_en || "Architectural Steel Furniture";
  const tagline =
    product?.tagline ||
    "Heavy-gauge steel engineering designed for contemporary luxury interiors.";

  // Calculate starting price
  const validPrices = (product?.sizes || [])
    .map((s) => Number(s.price))
    .filter((p) => !isNaN(p) && p > 0);

  const startingPrice = validPrices.length > 0
    ? Math.min(Number(product?.base_price || Infinity), ...validPrices)
    : Number(product?.base_price || 24500);

  // Default Finish & Image
  const defaultFinish =
    product?.finishes?.find((f) => f.is_default) || product?.finishes?.[0];

  const rawImg =
    defaultFinish?.media?.lifestyle ||
    defaultFinish?.media?.front ||
    defaultFinish?.media?.macro ||
    "/hero-bedroom.png";

  const siteUrl = getSiteUrl();
  const imageUrl = rawImg.startsWith("http")
    ? rawImg
    : `${siteUrl}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`;

  const categoryName = product?.category?.name_en || "Master Bedroom";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#FAF8F5",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Left 55%: Product Stage Framing (Warm Alabaster Canvas) */}
        <div
          style={{
            width: "55%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "48px",
            boxSizing: "border-box",
            backgroundColor: "#FAF8F5",
            position: "relative",
          }}
        >
          {/* Subtle Category Pill Badge */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: "48px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "999px",
              backgroundColor: "#EDE9E1",
              border: "1px solid rgba(24,24,27,0.1)",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "999px",
                backgroundColor: "#163826",
              }}
            />
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "#18181B",
              }}
            >
              {categoryName}
            </span>
          </div>

          {/* Product Image Stage */}
          <div
            style={{
              width: "100%",
              height: "440px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "24px",
              overflow: "hidden",
              backgroundColor: "#EDE9E1",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              marginTop: "20px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Subtle Finish Info Strip */}
          {defaultFinish?.finish_name && (
            <div
              style={{
                position: "absolute",
                bottom: "36px",
                left: "48px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "999px",
                  backgroundColor: defaultFinish.hex_code || "#36454F",
                  border: "2px solid #FAF8F5",
                  boxShadow: "0 0 0 1px rgba(24,24,27,0.2)",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  color: "#71717A",
                  fontWeight: 600,
                }}
              >
                Shown: {defaultFinish.finish_name}
              </span>
            </div>
          )}
        </div>

        {/* Right 45%: Deep Charcoal (#18181B) Editorial Spec Card */}
        <div
          style={{
            width: "45%",
            height: "100%",
            backgroundColor: "#18181B",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 48px",
            boxSizing: "border-box",
            borderLeft: "2px solid #163826",
            position: "relative",
          }}
        >
          {/* Top Brand Header with GS Monogram */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 200 200"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <g fill="#163826">
                <polygon points="82,9 84,35 76,41 34,65 10,51 81,10" />
                <polygon points="8,57 32,72 32,133 79,161 79,188 9,149 8,58" />
                <polygon points="59,86 106,111 94,120 95,126 109,118 109,173 86,186 85,132 92,128 81,126 59,111 59,87" />
              </g>
              <g fill="#FAF8F5">
                <polygon points="128,20 128,48 111,58 110,67 85,53 87,43 127,21" />
                <polygon points="133,21 188,52 188,92 163,79 163,66 133,48 133,22" />
                <polygon points="85,59 185,116 161,129 154,126 86,88 85,60" />
                <polygon points="186,121 186,149 116,188 117,160 185,122" />
              </g>
            </svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "#FAF8F5",
                }}
              >
                GREEN STEEL FURNITURE
              </span>
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(250,248,245,0.5)",
                }}
              >
                Gorakhpur Studio Collection
              </span>
            </div>
          </div>

          {/* Middle: Product Title, Tagline, & Live Pricing Pill */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 800,
                color: "#FAF8F5",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </span>

            <span
              style={{
                fontSize: "15px",
                color: "rgba(250,248,245,0.7)",
                lineHeight: 1.45,
              }}
            >
              {tagline}
            </span>

            {/* Live Pricing Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                  backgroundColor: "rgba(250, 248, 245, 0.1)",
                  border: "1px solid rgba(250, 248, 245, 0.2)",
                  padding: "8px 18px",
                  borderRadius: "16px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(250, 248, 245, 0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Starting
                </span>
                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                    color: "#FAF8F5",
                    letterSpacing: "-0.01em",
                  }}
                >
                  ₹{startingPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#10B981",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Direct Factory Rate
              </span>
            </div>
          </div>

          {/* Footer Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              paddingTop: "16px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(250, 248, 245, 0.6)",
              }}
            >
              Pure Heavy-Gauge Steel · 15-Yr Warranty
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#10B981",
                fontWeight: 600,
              }}
            >
              greensteelfurniture.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

