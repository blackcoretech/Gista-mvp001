const svg = "<svg width=\"512\" height=\"512\" viewBox=\"0 0 512 512\" xmlns=\"http://www.w3.org/2000/svg\">\n  <defs>\n    <linearGradient id=\"gistaPurple\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\n      <stop offset=\"0%\" stop-color=\"#2A0A5E\"/>\n      <stop offset=\"45%\" stop-color=\"#3D0A8A\"/>\n      <stop offset=\"100%\" stop-color=\"#6D0DFF\"/>\n    </linearGradient>\n  </defs>\n  <rect x=\"0\" y=\"0\" width=\"512\" height=\"512\" rx=\"110\" ry=\"110\" fill=\"url(#gistaPurple)\"/>\n  <path d=\"M 38 262 C 70 235, 105 205, 150 185 C 190 168, 225 165, 256 185 C 287 165, 322 168, 362 185 C 407 205, 442 235, 474 262 C 442 295, 405 330, 355 355 C 310 375, 280 382, 256 382 C 232 382, 202 375, 157 355 C 107 330, 70 295, 38 262 Z\" fill=\"#FFFFFF\"/>\n  <path d=\"M 150 185 C 190 168, 225 165, 256 185 C 287 165, 322 168, 362 185 L 362 195 C 320 180, 285 182, 256 200 C 227 182, 192 180, 150 195 Z\" fill=\"#FFFFFF\"/>\n  <text x=\"258\" y=\"335\" font-family=\"Arial Black, Arial, sans-serif\" font-size=\"190\" font-weight=\"900\" text-anchor=\"middle\" fill=\"#2A0A5E\">G</text>\n</svg>";

export const size = { width: 512, height: 512 };
export const contentType = "image/svg+xml";

export default function AppleIcon() {
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=0, must-revalidate" } });
}
