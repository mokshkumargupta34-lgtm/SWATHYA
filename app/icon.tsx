import { ImageResponse } from "next/og";

export const runtime = "edge";

// Route segment config
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Brand favicon: a white "S" on the cyan→emerald gradient used across the app.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #22D3EE 0%, #059669 100%)",
          color: "white",
          fontSize: 22,
          fontWeight: 700,
          borderRadius: 8,
        }}
      >
        S
      </div>
    ),
    { ...size },
  );
}
