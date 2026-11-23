"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#FAF8F5",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          color: "#18181B",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "460px",
            width: "100%",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          {/* GS Isometric Monogram SVG */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <svg
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "64px", height: "64px" }}
              aria-hidden="true"
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
          </div>

          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: "#9A3412",
              marginBottom: "8px",
            }}
          >
            System Recovery
          </div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              margin: "0 0 12px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Application Restoring
          </h1>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#71717A",
              margin: "0 0 24px 0",
            }}
          >
            The root view encountered an unexpected interrupt. You can reload the application canvas directly.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: "#18181B",
                color: "#FAF8F5",
                padding: "10px 22px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reload Application
            </button>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/";
                }
              }}
              style={{
                backgroundColor: "#FFFFFF",
                color: "#18181B",
                padding: "10px 22px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                border: "1px solid rgba(24, 24, 27, 0.15)",
                cursor: "pointer",
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
