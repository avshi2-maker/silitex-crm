// gate.ts (src/lib/gate.ts) · updated 09.10.2026 17:05 (Asia/Jerusalem) — Phase-1 site gate (PIN → cookie). Edge-safe (Web Crypto). Phase 2 replaces this with Supabase Auth + roles.
export const GATE_COOKIE = "silitex_gate";
export const PUBLIC_PREFIXES = ["/request", "/survey", "/login", "/api/forms", "/api/login", "/silitex-logo.png", "/favicon.png", "/assets/", "/robots.txt"];
export function isPublicPath(p: string): boolean { return PUBLIC_PREFIXES.some((x) => p === x || p.startsWith(x)); }
export async function gateToken(pin: string): Promise<string> {
  const data = new TextEncoder().encode("silitex-gate-v1:" + pin);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
