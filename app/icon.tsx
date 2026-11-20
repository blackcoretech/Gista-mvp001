import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", position: "relative" }}>
        <div style={{ width: 390, height: 350, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderRadius: "118px 118px 118px 72px", background: "linear-gradient(145deg, #8b3dff 0%, #6d28d9 55%, #4f46e5 100%)", color: "#ffffff", fontSize: 292, fontWeight: 900, letterSpacing: -20, lineHeight: 1 }}>
          G
          <div style={{ position: "absolute", left: 2, bottom: -42, width: 82, height: 82, background: "#6d28d9", clipPath: "polygon(0 0, 100% 0, 0 100%)", borderRadius: "0 0 0 10px" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
