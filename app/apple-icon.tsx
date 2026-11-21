import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "180px", height: "180px", overflow: "hidden", borderRadius: "39px", background: "linear-gradient(90deg, #2A0A5E 0%, #3D0A8A 45%, #6D0DFF 100%)" }}>
        <svg style={{ position: "absolute", left: 0, top: 0 }} width="180" height="180" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path d="M 38 262 C 70 235, 105 205, 150 185 C 190 168, 225 165, 256 185 C 287 165, 322 168, 362 185 C 407 205, 442 235, 474 262 C 442 295, 405 330, 355 355 C 310 375, 280 382, 256 382 C 232 382, 202 375, 157 355 C 107 330, 70 295, 38 262 Z" fill="#FFFFFF" />
          <path d="M 150 185 C 190 168, 225 165, 256 185 C 287 165, 322 168, 362 185 L 362 195 C 320 180, 285 182, 256 200 C 227 182, 192 180, 150 195 Z" fill="#FFFFFF" />
        </svg>
        <div style={{ display: "flex", position: "absolute", left: 0, right: 0, top: "65px", textAlign: "center", justifyContent: "center", fontFamily: "Arial", fontSize: "66.8px", fontWeight: 900, lineHeight: 1, color: "#2A0A5E" }}>G</div>
      </div>
    ),
    { width: 180, height: 180, headers: { "Cache-Control": "public, max-age=0, must-revalidate" } }
  );
}
