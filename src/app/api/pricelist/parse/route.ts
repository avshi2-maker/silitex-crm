// route.ts (src/app/api/pricelist/parse/route.ts) · created 13.11.2026 13:30 (Asia/Jerusalem) — v1.11.0 📥 Silitex quote mail → price lines (AI) for the price list
// GET  → the latest Silitex mails in the Hub that carry a price (€ / EUR / /kg) — one click loads the mail into the reader
// POST {text, at?} → Claude reads the quote → {lines:[{product, code, pack_label, kg, eur_kg, incoterm, countertype, inci, cas, note}], usage}
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { ask } from "@/lib/ai";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";

export async function GET() {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ mails: [] });
  const r = await sb.from("hub_messages").select("id,at,from,body,thread_id").ilike("from", "%silitex.it%").or("body.ilike.%€%,body.ilike.% eur%,body.ilike.%/kg%,body.ilike.%price%").order("at", { ascending: false }).limit(15);
  const ids = Array.from(new Set((r.data || []).map((m) => m.thread_id).filter(Boolean)));
  const th = ids.length ? (await sb.from("threads").select("id,subject").in("id", ids)).data || [] : [];
  const subj = new Map(th.map((t) => [t.id, t.subject]));
  const mails = (r.data || []).map((m) => ({ id: m.id, at: m.at, from: String(m.from || "").replace(/<.*>/, "").trim(), subject: subj.get(m.thread_id) || "", body: String(m.body || "").split(/\n_{8,}|\nDa: |\nFrom: /)[0].slice(0, 6000) }));
  return NextResponse.json({ mails });
}

const PROMPT = (at: string) => `Read this price quotation from Silitex (Italian silicone producer) and extract EVERY priced product line.
Return ONLY JSON, no prose: {"lines":[{"product":"","code":"","pack_label":"","kg":0,"eur_kg":0,"incoterm":"","countertype":"","inci":"","cas":"","note":""}]}
Rules:
- product = the Silitex trade name exactly as written, with a space between letters and digits like the catalogue ("H160" → "H 160"). code = the [PO###] code if given, else "".
- One line per product × package size. pack_label in English, e.g. "25 kg canister", "200 kg drum", "1000 kg IBC". kg = the package net kg (number).
- eur_kg = price in EUR per kg (number). If the price is per package, divide by kg. If the currency is not EUR, put the price in note and eur_kg 0.
- incoterm as written (EXW, FCA, DAP…), else "".
- countertype = the competitor product it replaces, if stated (e.g. "XIAMETER OFX-8040"), else "".
- inci / cas ONLY if written in the mail. Never invent INCI or CAS.
- note = short English note: what the product is for, low cyclics, samples, TDS/MSDS attached or pending.
- The quote date is ${at}.`;

export async function POST(req: Request) {
  const b = (await req.json()) as { text?: string; at?: string };
  const text = (b.text || "").trim(); if (text.length < 20) return NextResponse.json({ error: "empty text" }, { status: 400 });
  const at = b.at || new Date().toISOString().slice(0, 10);
  try {
    const { text: out, usage } = await ask(PROMPT(at), text.slice(0, 12000), 2000, "en");
    const m = out.match(/\{[\s\S]*\}/); let lines: unknown[] = [];
    try { lines = m ? (JSON.parse(m[0]).lines as unknown[]) || [] : []; } catch { lines = []; }
    return NextResponse.json({ lines, usage, raw: lines.length ? "" : out });
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "AI failed" }, { status: 500 }); }
}
