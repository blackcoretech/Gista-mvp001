import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", position: "relative" }}>
        <div style={{ width: 138, height: 124, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderRadius: "42px 42px 42px 26px", background: "linear-gradient(145deg, #8b3dff 0%, #6d28d9 55%, #4f46e5 100%)", color: "#ffffff", fontSize: 104, fontWeight: 900, letterSpacing: -7, lineHeight: 1 }}>
          G
          <div style={{ position: "absolute", left: 1, bottom: -15, width: 29, height: 29, background: "#6d28d9", clipPath: "polygon(0 0, 100% 0, 0 100%)", borderRadius: "0 0 0 4px" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
