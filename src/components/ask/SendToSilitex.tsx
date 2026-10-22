"use client";
// SendToSilitex.tsx (src/components/ask/SendToSilitex.tsx) · created 22.10.2026 09:55 (Asia/Jerusalem) — 📮 under an "Ask Silitex" answer (owner only): turns the market question + the AI answer + its sources into an English technical e-mail to Federica / Eleonora (editable) → open in Outlook / copy / export bar → "✅ sent" writes every request into the Federica register (status asked, today) so Friday's report tracks it. Token meter on the AI call.
import { useState } from "react";
import Link from "next/link";
import { Card, btnPrimary, btnGhost, inputCls, Badge } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { PRIO } from "@/lib/fq-types";
import { useLang } from "@/i18n";
import type { Usage, SilitexContact } from "@/lib/types";
type Qi = { q: string; cat: string; prio: "blocker" | "important" | "nice"; on: boolean };
type Props = { question: string; answer: string; sources: string; contacts: SilitexContact[]; sessionTokens: number; sessionCost: number; onUsage: (u: Usage) => void };
export default function SendToSilitex({ question, answer, sources, contacts, sessionTokens, sessionCost, onUsage }: Props) {
  const { t: tr } = useLang();
  const to = contacts.filter((c) => c.dept === "mgmt" && c.email && !/^info@/i.test(c.email)).map((c) => c.email).join(";") || "info@silitex.it";
  const [busy, setBusy] = useState(""); const [err, setErr] = useState(""); const [usage, setUsage] = useState<Usage | null>(null);
  const [subj, setSubj] = useState(""); const [body, setBody] = useState(""); const [qs, setQs] = useState<Qi[]>([]); const [done, setDone] = useState(""); const [copied, setCopied] = useState(false);
  const draft = async () => {
    setBusy("ai"); setErr(""); setDone("");
    try {
      const r = await fetch("/api/silitex-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, answer, sources }) });
      const j = await r.json(); if (j.usage) { setUsage(j.usage); onUsage(j.usage); } if (!r.ok) throw new Error(j.error || "error");
      setSubj(j.subject); setBody(j.body); setQs((j.questions || []).map((x: Omit<Qi, "on">) => ({ ...x, on: true })));
    } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
    setBusy("");
  };
  const outlook = "https://outlook.office.com/mail/deeplink/compose?to=" + encodeURIComponent(to.replace(/;/g, ",")) + "&subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body.slice(0, 6000));
  const copy = () => navigator.clipboard?.writeText(subj + "\n\n" + body).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  const sent = async () => {
    const pick = qs.filter((x) => x.on); if (!pick.length) return setDone(tr("לא נבחרו שאלות"));
    setBusy("save"); const now = new Date().toISOString(); const stamp = Date.now().toString(36);
    const items = pick.map((x, i) => ({ id: "fq-" + stamp + "-" + i, q: x.q, cat: x.cat, who: "Federica", prio: x.prio, party: "silitex", status: "asked", asked: [now], answer: "", answered_at: null, leads: [], note: "From Ask Silitex: " + question.slice(0, 160) + " · e-mail: " + subj.slice(0, 120), created_at: now, due: null }));
    const r = await fetch("/api/federica", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
    setBusy(""); setDone(r.ok ? "✓ " + items.length + tr(" שאלות נוספו לרישום פדריקה") : tr("השמירה נכשלה — נסה שוב"));
  };
  return (
    <Card className="space-y-2 border-brand-100">
      <div className="flex flex-wrap items-center gap-2"><b className="flex-1">📮 {tr("שלח ל-Silitex — בקשה טכנית מהשאלה הזו")}</b><span className="text-xs text-slate-500" dir="ltr">{to}</span><button className={btnPrimary} disabled={!!busy || question.trim().length < 5} onClick={draft}>{busy === "ai" ? tr("כותב…") : subj ? "🔄 " + tr("כתוב מחדש") : "✨ " + tr("טיוטת מייל לפדריקה")}</button></div>
      {!subj && !busy && <div className="text-xs text-slate-500">{tr("הלקוח נשאר אנונימי. בלי מחירים ובלי הבטחות — רק מה שחסר כדי לשרת את הלקוח: נתונים, נוסחת פתיחה, TDS/SDS, רגולציה, דוגמאות.")}</div>}
      <TokenMeter usage={usage} sessionTokens={sessionTokens} sessionCost={sessionCost} busy={busy === "ai"} />
      {err && <div className="text-sm text-red-600">{err}</div>}
      {subj && (<>
        <input className={inputCls} dir="ltr" value={subj} onChange={(e) => setSubj(e.target.value)} />
        <textarea className={inputCls + " text-sm"} dir="ltr" rows={14} value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="flex flex-wrap gap-2"><a className={btnPrimary} href={outlook} target="_blank" rel="noreferrer">✉️ {tr("פתח ב-Outlook")}</a><button className={btnGhost} onClick={copy}>{copied ? tr("✓ הועתק") : "📋 " + tr("העתק")}</button></div>
        <div className="border rounded-xl p-2 space-y-1">
          <div className="text-sm font-medium">{tr("שאלות לרישום פדריקה")} <Badge tone="blue">{qs.filter((x) => x.on).length}</Badge></div>
          {qs.map((x, i) => (<label key={i} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={x.on} onChange={(e) => setQs(qs.map((y, k) => k === i ? { ...y, on: e.target.checked } : y))} className="mt-1" /><span>{PRIO[x.prio]?.icon}</span><span className="flex-1" dir="ltr">{x.q}</span><span className="text-[11px] text-slate-400">{x.cat}</span></label>))}
          <div className="flex flex-wrap items-center gap-2 pt-1"><button className={btnPrimary} disabled={!!busy} onClick={sent}>{busy === "save" ? "⏳" : "✅"} {tr("שלחתי — הוסף לרישום")}</button>{done && <span className="text-sm text-emerald-700">{done} · <Link href="/federica" className="underline">/federica</Link></span>}</div>
        </div>
        <ExportBar title={subj} text={subj + "\n\n" + body} filename={"silitex_request_" + new Date().toISOString().slice(0, 10) + ".txt"} />
      </>)}
    </Card>
  );
}
