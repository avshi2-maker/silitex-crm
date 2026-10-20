// geo.ts (src/lib/geo.ts) · updated 20.10.2026 05:20 (Asia/Jerusalem) — VISIT PLANNER helpers: distance (km), driving estimate, region of Israel, Waze / Google Maps links, nearest-neighbour route order.
export type Pt = { lat: number; lon: number };
export const hasGeo = (p: Partial<Pt>): p is Pt => typeof p.lat === "number" && typeof p.lon === "number" && !!p.lat && !!p.lon;
export function km(a: Pt, b: Pt): number { const R = 6371, r = Math.PI / 180; const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r; const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
/** road km ≈ straight line × 1.3; average 55 km/h incl. traffic → minutes */
export const driveMin = (a: Pt, b: Pt) => Math.round(((km(a, b) * 1.3) / 55) * 60);
export const REGIONS: { key: string; he: string; test: (p: Pt) => boolean }[] = [
  { key: "north", he: "צפון וגליל", test: (p) => p.lat >= 32.86 },
  { key: "haifa", he: "חיפה והקריות", test: (p) => p.lat >= 32.68 && p.lat < 32.86 },
  { key: "sharon", he: "שרון וחדרה", test: (p) => p.lat >= 32.13 && p.lat < 32.68 },
  { key: "center", he: "מרכז", test: (p) => p.lat >= 31.85 && p.lat < 32.13 && p.lon < 35.0 },
  { key: "jlm", he: "ירושלים וים המלח", test: (p) => p.lat < 32.13 && p.lon >= 35.0 },
  { key: "south", he: "דרום", test: (p) => p.lat < 31.85 && p.lon < 35.0 },
];
export const regionOf = (p: Partial<Pt>) => (hasGeo(p) ? REGIONS.find((r) => r.test(p))?.key || "" : "");
export const wazeUrl = (p: Partial<Pt> & { address?: string }) => hasGeo(p) ? "https://waze.com/ul?ll=" + p.lat + "%2C" + p.lon + "&navigate=yes" : "https://waze.com/ul?q=" + encodeURIComponent(p.address || "") + "&navigate=yes";
export const gmapsUrl = (p: Partial<Pt> & { address?: string }) => "https://www.google.com/maps/search/?api=1&query=" + (hasGeo(p) ? p.lat + "," + p.lon : encodeURIComponent(p.address || ""));
/** Google Maps route with up to 9 stops (origin → stops → back is optional) */
export function gmapsRoute(origin: Pt, stops: Pt[], back = false): string {
  const s = stops.slice(0, 9).map((p) => p.lat + "," + p.lon); const dest = back ? origin.lat + "," + origin.lon : s.pop() || "";
  return "https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=" + origin.lat + "," + origin.lon + "&destination=" + dest + (s.length ? "&waypoints=" + encodeURIComponent(s.join("|")) : "");
}
/** shortest-first order from the start point (nearest neighbour) */
export function orderRoute<T extends Pt>(start: Pt, stops: T[]): T[] { const left = [...stops]; const out: T[] = []; let cur: Pt = start; while (left.length) { left.sort((a, b) => km(cur, a) - km(cur, b)); const n = left.shift()!; out.push(n); cur = n; } return out; }
