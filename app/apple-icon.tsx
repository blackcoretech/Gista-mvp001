import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #8b3dff 0%, #6d28d9 58%, #4f46e5 100%)",
          borderRadius: 38
        }}
      >
        <div
          style={{
            width: 122,
            height: 106,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "36px 36px 36px 19px",
            background: "rgba(255,255,255,0.16)",
            border: "3px solid rgba(255,255,255,0.9)",
            color: "#ffffff",
            fontSize: 90,
            fontWeight: 900,
            letterSpacing: -8,
            lineHeight: 1
          }}
        >
          G
        </div>
      </div>
    ),
    { ...size }
  );
}
