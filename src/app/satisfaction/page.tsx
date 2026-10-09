"use client";
// page.tsx (src/app/satisfaction/page.tsx) · updated 09.10.2026 13:20 (Asia/Jerusalem) — internal view of survey + form submissions (Supabase) + AI analysis; share links to public forms
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, H1, Badge, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import { SURVEY_CRITERIA } from "@/config/survey";
import { SAT_PROMPT } from "@/prompts/satisfaction";
import { useLang } from "@/i18n";
import { fmtDateTime } from "@/lib/format";
type Sub = { id: number; created_at: string; kind: string; company: string; name: string; email: string; product?: string; message?: string; fields: Record<string, number | string> };
const DEMO: Sub[] = [{ id: 1, created_at: new Date().toISOString(), kind: "survey", company: "Sano Bruno's", name: "Dana Cohen", email: "d@sano.co.il", product: "BERETEX 750", message: "Fast delivery from local stock; please add Hebrew SDS.", fields: { quality: 5, docs: 4, supply: 5, support: 5, samples: 4, price: 3, packaging: 4, comm: 5, nps: 9 } }, { id: 2, created_at: new Date().toISOString(), kind: "survey", company: "Infinya", name: "Amir Ben-David", email: "a@infinya.co.il", product: "CPL 2907", message: "Trial OK; need FDA letter on letterhead.", fields: { quality: 4, docs: 3, supply: 4, support: 4, samples: 5, price: 4, packaging: 4, comm: 4, nps: 8 } }];
export default function SatisfactionPage() {
  const { t: tr } = useLang(); const { state, ready, addSpend } = useStore();
  const [items, setItems] = useState<Sub[]>([]); const [source, setSource] = useState("…");
  useEffect(() => { fetch("/api/forms").then((r) => r.json()).then((j) => { if (j.items?.length) { setItems(j.items); setSource("Supabase"); } else { setItems(DEMO); setSource("demo"); } }).catch(() => { setItems(DEMO); setSource("demo"); }); }, []);
  if (!ready) return null;
  const surveys = items.filter((i) => i.kind === "survey"); const forms = items.filter((i) => i.kind !== "survey");
  const avg = (k: string) => surveys.length ? (surveys.reduce((a, s) => a + Number(s.fields?.[k] || 0), 0) / surveys.length) : 0;
  const nps = surveys.length ? Math.round(((surveys.filter((s) => Number(s.fields?.nps) >= 9).length - surveys.filter((s) => Number(s.fields?.nps) <= 6).length) / surveys.length) * 100) : 0;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const ctx = surveys.map((s) => s.company + " (" + s.product + "): " + SURVEY_CRITERIA.map((c) => c.key + "=" + s.fields?.[c.key]).join(", ") + ", nps=" + s.fields?.nps + ". Comment: " + (s.message || "—")).join("\n");
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between"><H1 sub={tr("משובי לקוחות + פניות מהטפסים הציבוריים · מקור: ") + source}>{tr("שביעות רצון לקוחות")}</H1><div className="flex gap-2"><a className={btnGhost} href="/survey?lang=en" target="_blank">🔗 {tr("טופס סקר")}</a><a className={btnGhost} href="/request?lang=en" target="_blank">🔗 {tr("טופס פנייה")}</a></div></div>
      <div className="grid md:grid-cols-[1fr_200px] gap-4">
        <Card><h3 className="font-bold mb-2">{tr("ממוצע לפי קריטריון")} ({surveys.length})</h3>{SURVEY_CRITERIA.map((c) => (<div key={c.key} className="flex items-center gap-2 text-sm py-1"><span className="w-64 truncate">{tr(c.he)}</span><div className="flex-1 bg-slate-100 rounded h-3"><div className="bg-brand-500 h-3 rounded" style={{ width: (avg(c.key) / 5) * 100 + "%" }} /></div><span className="w-8 text-end tabular-nums">{avg(c.key).toFixed(1)}</span></div>))}</Card>
        <Card className="text-center"><div className="text-xs text-slate-500">NPS</div><div className={"text-5xl font-bold " + (nps >= 50 ? "text-emerald-600" : nps >= 0 ? "text-amber-600" : "text-red-600")}>{nps}</div><div className="text-xs text-slate-400">{tr("ממליצים − מתנגדים")}</div></Card>
      </div>
      <Card><AiPanel title={tr("ניתוח שביעות רצון")} buttonLabel={tr("נתח עם Claude")} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} buildPrompt={() => ({ context: ctx || "(no responses yet)", prompt: SAT_PROMPT })} /></Card>
      <Card className="p-0 overflow-x-auto"><div className="p-3 font-bold">{tr("פניות מהטפסים")} ({forms.length})</div><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-2 text-start">{tr("תאריך")}</th><th className="p-2 text-start">{tr("סוג")}</th><th className="p-2 text-start">{tr("חברה")}</th><th className="p-2 text-start">{tr("איש קשר")}</th><th className="p-2 text-start">{tr("מוצר")}</th><th className="p-2 text-start">{tr("פרטים")}</th></tr></thead><tbody>{forms.map((f) => (<tr key={f.id} className="border-t"><td className="p-2 whitespace-nowrap">{fmtDateTime(f.created_at)}</td><td className="p-2"><Badge tone="blue">{f.kind}</Badge></td><td className="p-2 font-medium">{f.company}</td><td className="p-2">{f.name}<div className="text-xs text-slate-400">{f.email}</div></td><td className="p-2">{f.product}</td><td className="p-2 text-xs text-slate-500">{Object.entries(f.fields || {}).map(([k, v]) => k + ": " + v).join(" · ")} {f.message}</td></tr>))}{forms.length === 0 && <tr><td className="p-3 text-slate-400" colSpan={6}>{tr("אין פניות עדיין — כל פנייה מהטופס מגיעה גם למייל avshi@sapirim.com")}</td></tr>}</tbody></table></Card>
      <Card className="text-xs text-slate-500"><details><summary className="cursor-pointer">⚙</summary>Resend: <code>RESEND_API_KEY</code>, <code>FORMS_TO</code> (default avshi@sapirim.com), <code>FORMS_FROM</code> (verified domain sender, e.g. crm@marble-art.co.il). Storage: <code>SUPABASE_SERVICE_ROLE_KEY</code> → table form_submissions. Share: {origin}/request?lang=en · {origin}/survey?lang=en</details></Card>
    </div>
  );
}
