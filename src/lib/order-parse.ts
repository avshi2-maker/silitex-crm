// order-parse.ts (src/lib/order-parse.ts) · created 16.11.2026 18:50 (Asia/Jerusalem) — v1.14.0 ✨ read a customer's sample / product request (mail, WhatsApp, pasted text) → order fields. Server only.
// customerMails: the customer's own latest mails on the project's threads (already synced from Outlook into the Hub — no new Outlook login, no copy-paste).
import { ask } from "./ai";
import type { serviceClient } from "./server-data";
import type { Parsed } from "./orders-server";
import type { Usage } from "./types";
type SB = NonNullable<ReturnType<typeof serviceClient>>;

const PROMPT = `You read a customer's request for a silicone product (Hebrew, English or another language). Reply with ONE line of JSON only:
{"kind":"sample|product","lines":[{"product":"","code":"","qty":0,"kg":0,"pack":"","price":0}],"delivery_address":"","contact":"","phone":"","email":"","customer_po":"","notes":"","summary":""}
- lines: every product the customer asks for. product = the name as written; code = a product code if given (e.g. PO129, E2120); qty = number of packs; kg = total kg (1 for a sample size like "1 kg sample" or when no size is given for a sample); pack = pack as written ("sample", "25 kg canister", "1 kg bottle").
- price only if the CUSTOMER states a price (e.g. in a PO); else 0.
- delivery_address / contact / phone / email: only for delivery or the person to contact, as written.
- customer_po: their PO / order number if given.
- notes: one short English line of special requests (urgent, shipping, documents, deadlines).
- summary: one short Hebrew line of what the customer asks.
Copy values exactly, never invent; empty string / 0 when not given.`;
const QUOTE = /\n\s*(From:|Da:|-----\s*Original|On .{3,80} wrote:|מאת:|‫?בתאריך .*מאת)/i;
export const stripQuote = (b: string) => String(b || "").split(QUOTE)[0].trim();

export async function parseRequest(text: string, context = ""): Promise<{ parsed: Parsed & { summary?: string }; usage: Usage }> {
  const r = await ask(PROMPT, (context ? context + "\n\n" : "") + text.slice(0, 8000), 700, "en");
  let parsed: Parsed & { summary?: string } = {}; try { const m = /\{[\s\S]*\}/.exec(r.text); if (m) parsed = JSON.parse(m[0]); } catch { /* empty */ }
  return { parsed, usage: r.usage };
}
/** the customer's latest own mails on the project's threads (not ours, not Silitex), newest first */
export async function customerMails(sb: SB, projectId: string, n = 3): Promise<{ at: string; from: string; body: string }[]> {
  const ths = ((await sb.from("threads").select("id").contains("refs", { project: projectId })).data || []).map((t) => t.id);
  if (!ths.length) return [];
  const ms = ((await sb.from("hub_messages").select("at,from,body").in("thread_id", ths).eq("direction", "in").order("at", { ascending: false }).limit(12)).data || []) as { at: string; from: string; body: string }[];
  return ms.filter((m) => !/silitex\.it|sapirim\.com/i.test(m.from || "")).slice(0, n).map((m) => ({ ...m, body: stripQuote(m.body).slice(0, 3000) }));
}
