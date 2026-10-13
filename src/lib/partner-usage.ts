// partner-usage.ts (src/lib/partner-usage.ts) · updated 13.10.2026 06:40 (Asia/Jerusalem) — per-partner usage log (Supabase table partner_usage): logins, AI questions with tokens + cost. Fire-and-forget; never blocks the request.
import { serviceClient } from "./server-data";
export type PartnerEvent = { partner: string; path: string; kind: "login" | "ask" | "view"; question?: string; input_tokens?: number; output_tokens?: number; cost_usd?: number; model?: string; lang?: string };
export function logPartner(e: PartnerEvent) {
  const sb = serviceClient(); if (!sb) return;
  sb.from("partner_usage").insert({ partner: e.partner, path: e.path, kind: e.kind, question: (e.question || "").slice(0, 400) || null, input_tokens: e.input_tokens ?? null, output_tokens: e.output_tokens ?? null, cost_usd: e.cost_usd ?? null, model: e.model || null, lang: e.lang || null }).then(({ error }) => { if (error) console.warn("partner_usage", error.message); });
}
export type PartnerStat = { partner: string; logins: number; asks: number; tokens: number; cost_usd: number; last_at: string | null };
export async function partnerStats(): Promise<{ stats: PartnerStat[]; recent: { at: string; partner: string; kind: string; question: string | null; cost_usd: number | null; lang: string | null }[] }> {
  const sb = serviceClient(); if (!sb) return { stats: [], recent: [] };
  const { data } = await sb.from("partner_usage").select("at, partner, kind, question, input_tokens, output_tokens, cost_usd, lang").order("at", { ascending: false }).limit(2000);
  const rows = data || []; const m: Record<string, PartnerStat> = {};
  for (const r of rows) { const s = (m[r.partner] ||= { partner: r.partner, logins: 0, asks: 0, tokens: 0, cost_usd: 0, last_at: null }); if (r.kind === "login") s.logins++; if (r.kind === "ask") { s.asks++; s.tokens += (r.input_tokens || 0) + (r.output_tokens || 0); s.cost_usd += Number(r.cost_usd || 0); } if (!s.last_at) s.last_at = r.at; }
  return { stats: Object.values(m).sort((a, b) => b.asks - a.asks), recent: rows.filter((r) => r.kind === "ask").slice(0, 50) };
}
