import { ImageResponse } from "next/og";
import { SiteSettingsService } from "@/services/SiteSettingsService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

/**
 * Root Master Brand OpenGraph Banner
 * Rendered at: /opengraph-image
 * Displayed when sharing root URL, /categories, or /reviews on WhatsApp and social platforms.
 */
export default async function OpenGraphImage() {
  const settings = await SiteSettingsService.getSiteSettings().catch(() => null);
  const brandName = settings?.brand_name || "GREEN STEEL FURNITURE";
  const districts = settings?.service_districts?.slice(0, 4) || [
    "Gorakhpur",
    "Lucknow",
    "Varanasi",
    "Patna",
  ];

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
        {/* Left Side: Editorial Typography & Brand Coordinates (60%) */}
        <div
          style={{
            width: "62%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 56px",
            boxSizing: "border-box",
          }}
        >
          {/* Top Brand Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* GS Monogram SVG */}
            <svg
              width="44"
              height="44"
              viewBox="0 0 200 200"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <g fill="#163826">
                <polygon points="82,9 84,35 76,41 34,65 10,51 81,10" />
                <polygon points="8,57 32,72 32,133 79,161 79,188 9,149 8,58" />
                <polygon points="59,86 106,111 94,120 95,126 109,118 109,173 86,186 85,132 92,128 81,126 59,111 59,87" />
              </g>
              <g fill="#18181B">
                <polygon points="128,20 128,48 111,58 110,67 85,53 87,43 127,21" />
                <polygon points="133,21 188,52 188,92 163,79 163,66 133,48 133,22" />
                <polygon points="85,59 185,116 161,129 154,126 86,88 85,60" />
                <polygon points="186,121 186,149 116,188 117,160 185,122" />
              </g>
            </svg>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "14px",
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "#18181B",
                }}
              >
                {brandName}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#71717A",
                  marginTop: "2px",
                }}
              >
                Architectural Steel Works · Gorakhpur
              </span>
            </div>
          </div>

          {/* Main Headline & Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <span
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#18181B",
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
              }}
            >
              Pure Steel. Perfected for Home.
            </span>
            <span
              style={{
                fontSize: "18px",
                color: "#52525B",
                lineHeight: 1.45,
                maxWidth: "520px",
              }}
            >
              Heavy-gauge architectural steel almirahs, walk-in closets, and modular
              bedroom suites engineered for generations.
            </span>
          </div>

          {/* District Coverage Strip */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#163826",
                fontWeight: 700,
              }}
            >
              White-Glove Delivery & Installation Across
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {districts.map((d) => (
                <span
                  key={d}
                  style={{
                    backgroundColor: "#EDE9E1",
                    color: "#18181B",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "4px 12px",
                    borderRadius: "999px",
                    border: "1px solid rgba(24,24,27,0.1)",
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Deep Charcoal Feature Card (38%) */}
        <div
          style={{
            width: "38%",
            height: "100%",
            backgroundColor: "#18181B",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 48px",
            boxSizing: "border-box",
            borderLeft: "2px solid #163826",
            position: "relative",
          }}
        >
          {/* Top Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(22, 56, 38, 0.45)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "6px 14px",
              borderRadius: "999px",
              alignSelf: "flex-start",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                backgroundColor: "#10B981",
              }}
            />
            <span
              style={{
                color: "#FAF8F5",
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Factory Direct
            </span>
          </div>

          {/* Three Key Pillar Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: 800,
                  color: "#FAF8F5",
                  letterSpacing: "-0.02em",
                }}
              >
                15-Year
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "#A1A1AA",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Anti-Rust Craftsmanship Warranty
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: 800,
                  color: "#FAF8F5",
                  letterSpacing: "-0.02em",
                }}
              >
                Zero
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "#A1A1AA",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Termite, Moisture, & Fire Vulnerability
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: 800,
                  color: "#FAF8F5",
                  letterSpacing: "-0.02em",
                }}
              >
                100%
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "#A1A1AA",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Tata Steel Heavy-Gauge Raw Materials
              </span>
            </div>
          </div>

          {/* Bottom URL */}
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
                fontSize: "12px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(250, 248, 245, 0.65)",
              }}
            >
              greensteelfurniture.com
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#10B981",
                fontWeight: 600,
              }}
            >
              Direct Studio Inquiry →
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

