// manifest.ts (src/app/manifest.ts) · updated 18.10.2026 07:55 (Asia/Jerusalem) — home-screen install: the phone icon always opens FIELD MODE full-screen (not the CRM)
import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Silitex Field", short_name: "Silitex", description: "Silitex Israel — field mode",
    start_url: "/field", scope: "/", display: "standalone", orientation: "portrait",
    background_color: "#f8fafc", theme_color: "#1f1a24", lang: "he", dir: "rtl",
    icons: [{ src: "/field-icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/field-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
