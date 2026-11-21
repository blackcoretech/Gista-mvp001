import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Gista",
    short_name: "Gista",
    description: "Every Post Starts a Conversation.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#2A0A5E",
    theme_color: "#3D0A8A",
    categories: ["social", "communication"],
    icons: [
      { src: "/icon?v=20261121", sizes: "512x512", type: "image/png", purpose: "any" }
    ]
  };
}
