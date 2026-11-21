import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gistaPurple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2A0A5E" />
            <stop offset="45%" stopColor="#3D0A8A" />
            <stop offset="100%" stopColor="#6D0DFF" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="512" height="512" rx="110" ry="110" fill="url(#gistaPurple)" />
        <path d="M 38 262 C 70 235, 105 205, 150 185 C 190 168, 225 165, 256 185 C 287 165, 322 168, 362 185 C 407 205, 442 235, 474 262 C 442 295, 405 330, 355 355 C 310 375, 280 382, 256 382 C 232 382, 202 375, 157 355 C 107 330, 70 295, 38 262 Z" fill="#FFFFFF" />
        <path d="M 150 185 C 190 168, 225 165, 256 185 C 287 165, 322 168, 362 185 L 362 195 C 320 180, 285 182, 256 200 C 227 182, 192 180, 150 195 Z" fill="#FFFFFF" />
        <text x="258" y="335" fontFamily="Arial Black, Arial, sans-serif" fontSize="190" fontWeight="900" textAnchor="middle" fill="#2A0A5E">G</text>
      </svg>
    ),
    { width: 180, height: 180, headers: { "Cache-Control": "public, max-age=0, must-revalidate" } }
  );
}
