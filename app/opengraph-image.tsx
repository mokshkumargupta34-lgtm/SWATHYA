import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "SWASTHYA — Health, Wellness & Care Access";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share card. Generated at build/request time so no binary asset is
// committed to the repo.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #02101a 0%, #04303a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #22D3EE 0%, #059669 100%)",
              fontSize: 40,
            }}
          >
            ♥
          </div>
          SWASTHYA
        </div>
        <div style={{ marginTop: 40, fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>
          Healthcare, closer to home.
        </div>
        <div style={{ marginTop: 24, fontSize: 30, color: "#a5f3fc", maxWidth: 900 }}>
          Care that travels the last mile — in distance, cost and language.
        </div>
      </div>
    ),
    { ...size },
  );
}
