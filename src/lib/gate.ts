// gate.ts (src/lib/gate.ts) · updated 13.10.2026 07:30 — /partners (owner analytics) explicitly excluded from partner access (Asia/Jerusalem) — Phase-1 site gate (PIN → cookie) + PARTNER access (Silitex staff: name+PIN → cookie, read-only knowledge pages only). Edge-safe (Web Crypto).
export const GATE_COOKIE = "silitex_gate";
export const PARTNER_COOKIE = "silitex_partner";          // httpOnly token
export const PARTNER_NAME_COOKIE = "silitex_partner_name"; // readable by the UI (Nav)
export const PUBLIC_PREFIXES = ["/request", "/survey", "/login", "/api/forms", "/api/login", "/api/hub/outlook/cb", "/api/hub/wa/", "/silitex-logo.png", "/favicon.png", "/assets/", "/robots.txt"];
/** what a Silitex partner may open: knowledge only — no leads, pipeline, hub, pricing, notes */
export const PARTNER_PREFIXES = ["/partner", "/ask", "/products", "/offsets", "/formulations", "/faq", "/catalogues/", "/api/ai", "/api/partner/me", "/api/partner/feedback", "/api/partner/weather", "/api/partner/support"];
export function isPublicPath(p: string): boolean { return PUBLIC_PREFIXES.some((x) => p === x || p.startsWith(x)) || p === "/api/hub/wa"; }
export function isPartnerPath(p: string): boolean { if (p === "/partners" || p.startsWith("/partners/")) return false; return PARTNER_PREFIXES.some((x) => p === x || p.startsWith(x.endsWith("/") ? x : x + "/")); }
async function sha(s: string): Promise<string> { const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join(""); }
export async function gateToken(pin: string): Promise<string> { return sha("silitex-gate-v1:" + pin); }
export async function partnerToken(name: string, pin: string): Promise<string> { return sha("silitex-partner-v1:" + name.toLowerCase() + ":" + pin); }
/** PARTNER_PINS env: "federica:4821,marco:7733" → map */
export function partnerPins(): Record<string, string> { const out: Record<string, string> = {}; for (const pair of (process.env.PARTNER_PINS || "").split(",")) { const [n, p] = pair.split(":").map((s) => s?.trim()); if (n && p) out[n.toLowerCase()] = p; } return out; }
