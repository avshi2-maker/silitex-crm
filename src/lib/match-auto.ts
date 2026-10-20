// match-auto.ts (src/lib/match-auto.ts) · created 20.10.2026 18:40 (Asia/Jerusalem) — server only · AUTOMATIC RUN after a FREE MATCH REPORT request: (1) WhatsApp ping to Avshi, (2) website scan, (3) report draft in the visitor's language → saved on the request row (fields.auto). Nothing is sent to the customer — Avshi reviews on /scan.
import { scanSite, bundle } from "./sitescan";
import { scanPrompt, sectorOf, silitexList } from "@/prompts/scan";
import { ask } from "./ai";
import { parseLoose } from "./studio/json";
import { sendWhatsApp } from "./whatsapp";
import { reportPrompt, REPORT_LANG } from "./match-report";
import { updateFields, type Submission } from "./forms";
export type AutoRun = { at: string; ping?: { sent: boolean; provider: string; error?: string }; scan?: unknown; pages?: number; urls?: string[]; sector?: string; scanAt?: string; draft?: string; tokens: number; cost: number; error?: string; done: boolean };
const BASE = process.env.CRM_URL || "https://silitex.marble-art.co.il";
export async function runAuto(id: number | null, s: Submission): Promise<AutoRun> {
  const f = (s.fields || {}) as Record<string, string>; const run: AutoRun = { at: new Date().toISOString(), tokens: 0, cost: 0, done: false };
  const save = async () => { if (id) await updateFields(id, { ...f, auto: run }); };
  const ping = await sendWhatsApp("🎁 בקשת דוח התאמה חדשה מ-sapirim.com\n" + s.company + " · " + (f.industry || "") + "\n" + s.name + " · " + (s.phone || "") + " · " + s.email + "\n" + (f.website || "") + "\n⚡ סריקה + טיוטה רצות עכשיו → " + BASE + "/scan");
  run.ping = { sent: ping.sent, provider: ping.provider, error: ping.error?.slice(0, 200) }; await save();
  try {
    if (!f.website) throw new Error("no website");
    const { pages, error } = await scanSite(f.website);
    if (!pages.length) throw new Error(error || "nothing read");
    const sector = sectorOf(f.industry || "");
    const a = await ask(scanPrompt({ name: s.company, industry: f.industry || "", sector, site: bundle(pages), list: silitexList(sector) }), undefined, 3500, "any");
    run.tokens += a.usage.input_tokens + a.usage.output_tokens; run.cost += a.usage.cost_usd;
    const data = parseLoose(a.text); if (!data) throw new Error("scan: no JSON");
    Object.assign(run, { scan: data, pages: pages.length, urls: pages.map((p) => p.url), sector, scanAt: new Date().toISOString() }); await save();
    const lang = REPORT_LANG[s.lang || ""] ? (s.lang as string) : "he";
    const d = await ask(reportPrompt({ company: s.company, contact: s.name, lang, industry: f.industry || "", scan: data }), undefined, 1400, lang as "he" | "en" | "ru" | "it");
    run.tokens += d.usage.input_tokens + d.usage.output_tokens; run.cost += d.usage.cost_usd; run.draft = d.text;
  } catch (e) { run.error = e instanceof Error ? e.message : "auto run failed"; }
  run.done = true; await save(); return run;
}
