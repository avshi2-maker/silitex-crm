// route.ts (src/app/api/geo/route.ts) · updated 20.10.2026 05:20 (Asia/Jerusalem) — ADDRESS → GPS for the visit planner: GET ?q=<address in Hebrew or English> → best matches in Israel {lat, lon, label} (OpenStreetMap Nominatim, free, no key). Owner only (PIN gate).
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 200);
  if (q.length < 3) return NextResponse.json({ results: [] });
  try {
    const r = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=il&accept-language=he,en&q=" + encodeURIComponent(q), { headers: { "User-Agent": "Silitex-CRM/1.0 (avshi@sapirim.com)" }, cache: "no-store" });
    const j = (await r.json()) as { lat: string; lon: string; display_name: string }[];
    return NextResponse.json({ results: (j || []).map((x) => ({ lat: Number(Number(x.lat).toFixed(5)), lon: Number(Number(x.lon).toFixed(5)), label: x.display_name })) });
  } catch (e) { return NextResponse.json({ results: [], error: e instanceof Error ? e.message : "error" }); }
}
