"use client";
// MatchRequests.tsx (src/components/scan/MatchRequests.tsx) · updated 20.10.2026 18:40 (Asia/Jerusalem) — uses the AUTOMATIC run (fields.auto: WhatsApp ping, scan, draft) — ⚡ ready badge, lead created from the ready scan without re-scanning, draft pre-filled · created 18:30 — CRM review panel for FREE MATCH REPORT requests from sapirim.com: each request → ➕ lead + 🔎 website scan → 📝 AI draft in the visitor's language (editable) → 📧 open in mail to the customer / export bar → ✓ mark sent (activity on the lead). Nothing goes out without Avshi.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, Badge, btnGhost, btnPrimary, inputCls } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { scanOf, withScan, type ScanResult } from "@/lib/scan";
import { CRM_INDUSTRY } from "@/portal/match";
import { fmtDateTime, uid } from "@/lib/format";
import type { Lead, Usage } from "@/lib/types";
import { useLang } from "@/i18n";
type Auto = { at: string; ping?: { sent: boolean; provider: string }; scan?: ScanResult["data"]; pages?: number; urls?: string[]; sector?: string; scanAt?: string; draft?: string; tokens: number; cost: number; error?: string; done: boolean };
type Sub = { id: number; created_at: string; kind: string; company: string; name: string; email: string; phone?: string; message?: string; lang?: string; fields?: Record<string, string> & { auto?: Auto } };
const host = (u = "") => u.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
export default function MatchRequests() {
  const { t: tr } = useLang();
  const { state, upsertLead, addActivity, addSpend } = useStore();
  const [items, setItems] = useState<Sub[]>([]); const [busy, setBusy] = useState(""); const [err, setErr] = useState<Record<number, string>>({});
  const [draft, setDraft] = useState<Record<number, string>>({}); const [usage, setUsage] = useState<Usage | null>(null); const [open, setOpen] = useState<number | null>(null);
  useEffect(() => { fetch("/api/forms").then((r) => r.json()).then((j) => setItems((j.items || []).filter((s: Sub) => s.kind === "match"))).catch(() => {}); }, []);
  if (!items.length) return null;
  const leadOf = (s: Sub): Lead | undefined => { const h = host(s.fields?.website); return state.leads.find((l) => (h && host(l.website) === h) || l.name.trim().toLowerCase() === s.company.trim().toLowerCase()); };
  const scanIt = async (s: Sub) => {
    setBusy("scan" + s.id); setErr((e) => ({ ...e, [s.id]: "" }));
    let l = leadOf(s);
    if (!l) { l = { id: uid("LEAD"), name: s.company, industry: CRM_INDUSTRY[s.fields?.industry_key || ""] || s.fields?.industry || tr("אחר"), sub_industry: "", product_match: "", use_case: s.message || "", volume_tons: 0, value_usd: 0, tier: "Tier 3 - New (to qualify)", department: "", contact_role: "", status: "new", stage: "prospect", contact_name: s.name, contact_phone: s.phone || "", contact_email: s.email, website: s.fields?.website, source: "🎁 דוח התאמה מהאתר", plan_next_action: "🎁 לשלוח דוח התאמה (ביקש באתר " + fmtDateTime(s.created_at) + ")" }; upsertLead(l); addActivity(l.id, "note", "🎁 ביקש דוח התאמה חינם באתר sapirim.com"); }
    const a = s.fields?.auto;
    if (a?.scan) { upsertLead(withScan(l, { data: a.scan, at: a.scanAt || a.at, pages: a.pages || 0, urls: a.urls || [], sector: a.sector || "" })); addSpend(a.tokens, a.cost); if (a.draft) { setDraft((d) => ({ ...d, [s.id]: d[s.id] || a.draft || "" })); setOpen(s.id); } setBusy(""); return; }
    try {
      const r = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: l.name, website: l.website || s.fields?.website, industry: l.industry }) });
      const j = await r.json(); if (j.usage) { setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); }
      if (!r.ok || !j.data) throw new Error(j.error || "no answer");
      const res: ScanResult = { data: j.data, at: j.at, pages: j.pages, urls: j.urls || [], sector: j.sector || "" }; upsertLead(withScan(l, res));
    } catch (e) { setErr((x) => ({ ...x, [s.id]: e instanceof Error ? e.message : "error" })); }
    setBusy("");
  };
  const write = async (s: Sub, l: Lead) => {
    const r0 = scanOf(l); if (!r0) return; setBusy("draft" + s.id);
    try {
      const r = await fetch("/api/match/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company: s.company, contact: s.name, lang: s.lang || "he", industry: l.industry, scan: r0.data }) });
      const j = await r.json(); if (j.usage) { setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); }
      if (!r.ok) throw new Error(j.error || "error"); setDraft((d) => ({ ...d, [s.id]: j.text })); setOpen(s.id);
    } catch (e) { setErr((x) => ({ ...x, [s.id]: e instanceof Error ? e.message : "error" })); }
    setBusy("");
  };
  const subj = (s: Sub) => (s.lang === "he" || !s.lang ? "דוח התאמה — " : s.lang === "it" ? "Report di abbinamento — " : s.lang === "ru" ? "Отчёт о подборе — " : "Match report — ") + s.company;
  const sent = (l: Lead, s: Sub) => { addActivity(l.id, "email", "🎁 דוח התאמה נשלח ל-" + s.email); upsertLead({ ...l, intake: { ...(l.intake || {}), match_sent: new Date().toISOString() }, plan_next_action: "📞 מעקב אחרי דוח ההתאמה — שיחה טכנית + דוגמה" }); };
  return (
    <Card className="space-y-3 border-2 border-amber-400">
      <div className="font-bold text-lg">🎁 {tr("בקשות דוח התאמה מהאתר")} <Badge tone="amber">{items.length}</Badge></div>
      <ul className="divide-y">
        {items.map((s) => { const l = leadOf(s); const r = l ? scanOf(l) : null; const done = !!l?.intake?.match_sent; const mailto = "mailto:" + s.email + "?subject=" + encodeURIComponent(subj(s)) + "&body=" + encodeURIComponent((draft[s.id] || "").slice(0, 1800)); return (
          <li key={s.id} className="py-2 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <b>{s.company}</b><a href={s.fields?.website} target="_blank" rel="noreferrer" className="text-xs underline text-slate-500" dir="ltr">{host(s.fields?.website)}</a>
              <span className="text-xs text-slate-500">{s.name} · {s.email} · <span dir="ltr">{s.phone}</span> · {s.fields?.industry} · {(s.lang || "he").toUpperCase()} · {fmtDateTime(s.created_at)}</span>
              <span className="ms-auto flex flex-wrap gap-1">
                {done ? <Badge tone="green">✓ {tr("נשלח")}</Badge> : r ? <Badge tone="blue">{tr("נסרק")} · {(r.data.matches || []).length} {tr("התאמות")}</Badge> : s.fields?.auto?.scan ? <Badge tone="amber">⚡ {tr("סריקה + טיוטה מוכנות")}</Badge> : s.fields?.auto && !s.fields.auto.done ? <Badge tone="slate">⏳ {tr("רץ אוטומטית…")}</Badge> : null}
                {s.fields?.auto?.error && !r && <span className="text-[11px] text-red-600" title={s.fields.auto.error}>⚠️ {tr("סריקה אוטומטית נכשלה")}</span>}
                {l && <Link href={"/leads/" + l.id} className={btnGhost + " text-xs"}>{tr("לכרטיס")}</Link>}
                {!r && <button className={btnPrimary + " text-xs"} disabled={!!busy} onClick={() => scanIt(s)}>{busy === "scan" + s.id ? "⏳ " + tr("סורק…") : s.fields?.auto?.scan ? (l ? "" : "➕ ") + "⚡ " + tr("פתח מוכן") : (l ? "" : "➕ ") + "🔎 " + tr("סריקה")}</button>}
                {r && l && s.fields?.auto?.draft && open !== s.id && <button className={btnPrimary + " text-xs"} onClick={() => { setDraft((d) => ({ ...d, [s.id]: d[s.id] || s.fields?.auto?.draft || "" })); setOpen(s.id); }}>⚡ {tr("טיוטה מוכנה")}</button>}
                {r && l && <button className={btnGhost + " text-xs"} disabled={!!busy} onClick={() => write(s, l)}>{busy === "draft" + s.id ? "⏳" : "📝 " + tr("טיוטת דוח")}</button>}
              </span>
            </div>
            {err[s.id] && <div className="text-xs text-red-600">⚠️ {err[s.id]}</div>}
            {open === s.id && draft[s.id] && l && (
              <div className="space-y-2 bg-slate-50 rounded-xl p-3">
                <textarea className={inputCls + " font-sans"} rows={14} dir={s.lang === "he" || !s.lang ? "rtl" : "ltr"} value={draft[s.id]} onChange={(e) => setDraft((d) => ({ ...d, [s.id]: e.target.value }))} />
                <div className="flex flex-wrap gap-2"><a href={mailto} className={btnPrimary + " text-sm"}>📧 {tr("פתח מייל ללקוח")}</a>{!done && <button className={btnGhost + " text-sm"} onClick={() => sent(l, s)}>✓ {tr("סמן כנשלח")}</button>}</div>
                <ExportBar title={subj(s)} text={draft[s.id]} filename={"match_report_" + host(s.fields?.website) + ".txt"} />
              </div>)}
          </li>); })}
      </ul>
      <TokenMeter usage={usage} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} busy={!!busy} />
    </Card>
  );
}
