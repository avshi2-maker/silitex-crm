// route.ts (src/app/api/partner/weather/route.ts) · updated 13.10.2026 08:00 (Asia/Jerusalem) — live Tel Aviv weather for the partner greeting (Open-Meteo, no key, cached 30 min on the edge/CDN)
import { NextResponse } from "next/server";
export const runtime = "nodejs"; export const revalidate = 1800;
const CODES: Record<number, [string, string]> = { 0: ["sunny", "sereno"], 1: ["mostly sunny", "poco nuvoloso"], 2: ["partly cloudy", "parzialmente nuvoloso"], 3: ["cloudy", "nuvoloso"], 45: ["foggy", "nebbia"], 48: ["foggy", "nebbia"], 51: ["drizzle", "pioviggine"], 53: ["drizzle", "pioviggine"], 55: ["drizzle", "pioviggine"], 61: ["light rain", "pioggia leggera"], 63: ["rain", "pioggia"], 65: ["heavy rain", "pioggia forte"], 80: ["showers", "rovesci"], 81: ["showers", "rovesci"], 82: ["showers", "rovesci"], 95: ["thunderstorm", "temporale"] };
export async function GET() {
  try {
    const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=32.08&longitude=34.78&current=temperature_2m,weather_code&timezone=Asia%2FJerusalem", { next: { revalidate: 1800 } });
    const j = await r.json(); const t = Math.round(j.current?.temperature_2m); const c = j.current?.weather_code ?? 0; const [en, it] = CODES[c] || ["", ""];
    return NextResponse.json({ city: "Tel Aviv", temp: t, en, it, code: c }, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } });
  } catch { return NextResponse.json({ city: "Tel Aviv", temp: null, en: "", it: "" }); }
}
