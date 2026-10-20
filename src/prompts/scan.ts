// scan.ts (src/prompts/scan.ts) · updated 20.10.2026 06:00 (Asia/Jerusalem) — CUSTOMER WEBSITE SCAN prompt: what the company makes + where silicones are used + match ONLY to the Silitex grades given (cosmetics = official cosmetic range + countertypes). Hebrew output, strict JSON. Honest: no invented products, no "identical / drop-in", confidence per match.
import { CAT26 } from "@/lib/catalog";
import { COSMETIC_COUNTERTYPES } from "@/config/cosmetic-range";
export function sectorOf(industry: string): string {
  if (/cosmetic|personal care/i.test(industry)) return "Cosmetics";
  if (/detergent|clean|household/i.test(industry)) return "Detergency";
  if (/agri|agro|food|ferment/i.test(industry)) return "Food & Agri";
  if (/paint|coating|varnish|building|repellent/i.test(industry)) return "Paint & Coating";
  if (/water/i.test(industry)) return "Water Treatment";
  return "";
}
export function silitexList(sector: string): string {
  const rows = CAT26.filter((r) => !sector || r.sector === sector);
  const seen = new Set<string>(); const lines: string[] = [];
  if (sector === "Cosmetics") for (const c of COSMETIC_COUNTERTYPES) { seen.add(c.product.toUpperCase()); lines.push("★ " + c.product + " (" + c.code + ") — INCI " + c.inci + " — official countertype: " + [c.dow, c.brb, c.momentive, c.wacker].filter(Boolean).join(" / ")); }
  for (const r of rows) { const k = r.product.toUpperCase(); if (seen.has(k)) continue; seen.add(k); lines.push("• " + r.product + (r.code ? " (" + r.code + ")" : "") + " — " + [r.inci, r.description].filter(Boolean).join(" — ").slice(0, 160)); if (lines.length > 140) break; }
  return lines.join("\n");
}
export function scanPrompt(o: { name: string; industry: string; sector: string; site: string; list: string }): string {
  return `You are a senior silicone application chemist helping Avshi Sapir (Sapirim, Israel) prepare a technical sales visit.
Company: ${o.name} · Industry: ${o.industry} · Website text below.

TASK
1. From the website text ONLY, list what the company makes: product lines / brands and typical products (keep original product names). Never invent products that are not in the text.
2. For each product type, say where silicones are typically used (function: feel, spreading, shine, water resistance, emulsifier, antifoam in process, etc.).
3. Match to Silitex grades from THIS LIST ONLY (${o.sector || "all sectors"}). ${o.sector === "Cosmetics" ? "For cosmetics, prefer the ★ official Silitex cosmetic range with its countertype; use other listed cosmetic grades only if clearly better, and never propose non-cosmetic grades." : "This sector's product map is still under Silitex review — mark matches as draft."}
   Never write "identical", "drop-in" or "full replacement" — write "equivalent to check in the lab".
4. Give 3–5 sharp R&D questions for the first meeting, and one sentence of value angle for the sales approach.

SILITEX LIST
${o.list}

Answer in Hebrew (product and grade names stay in their original language). Return ONLY JSON:
{"summary":"2-3 sentences","product_lines":[{"name":"","type":"","examples":[""]}],"silicone_uses":[{"function":"","where":""}],"matches":[{"silitex":"","code":"","countertype":"","for":"which product line","why":"","confidence":"high|medium|low"}],"questions":[""],"value_angle":"","not_found":"what you could not determine from the site"}

WEBSITE TEXT
${o.site}`;
}
