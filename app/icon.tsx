import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

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
          background: "linear-gradient(145deg, #8b3dff 0%, #6d28d9 58%, #4f46e5 100%)",
          borderRadius: 112
        }}
      >
        <div
          style={{
            width: 344,
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            borderRadius: "100px 100px 100px 54px",
            background: "rgba(255,255,255,0.16)",
            border: "8px solid rgba(255,255,255,0.88)",
            color: "#ffffff",
            fontSize: 250,
            fontWeight: 900,
            letterSpacing: -22,
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
