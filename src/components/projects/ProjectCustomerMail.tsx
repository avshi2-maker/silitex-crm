"use client";
// ProjectCustomerMail.tsx (src/components/projects/ProjectCustomerMail.tsx) · created 10.11.2026 14:00 (Asia/Jerusalem) — v1.10.0 ✉ mail to the CUSTOMER with the project number
// ✍ paste / write your own text, or ✨ draft the quotation from the Silitex answer (token meter + export bar). Subject = "Re: <their last subject>" with
// [#SPR-0001 · v1] first; a "Project ref" line closes the body. Outlook draft — you press Send. A quotation draft also saves Q-SPR-…-v<n> (version +1).
import { useEffect, useState } from "react";
import { Card, btnPrimary, btnGhost, inputCls, Badge } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import ExportBar from "@/components/ExportBar";
import { outlookDraft } from "@/lib/outlook-draft";
import { splitMail } from "@/lib/mail-text";
import { stampSubject, refLabel } from "@/lib/projects";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Project, Lead, Thread, Usage } from "@/lib/types";

type Props = { p: Project; lead?: Lead; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void; onLog: (t: string) => void; onQuote: (ref: string) => Promise<unknown> };
export default function ProjectCustomerMail({ p, lead, spend, addSpend, onLog, onQuote }: Props) {
  const { t: tr } = useLang(); const a = p.silitex_answer;
  const [to, setTo] = useState(lead?.contact_email || ""); const [subj, setSubj] = useState(""); const [text, setText] = useState(""); const [ref, setRef] = useState(true);
  const [mode, setMode] = useState<"own" | "quote">("own"); const [err, setErr] = useState(""); const [ok, setOk] = useState("");
  useEffect(() => { fetch("/api/hub/ingest", { cache: "no-store" }).then((r) => r.json()).then((j) => {
    const t = ((j.threads || []) as Thread[]).filter((x) => x.refs?.lead_id === p.lead_id && x.dept === "il" && x.topic !== "whatsapp").sort((x, y) => y.last_at.localeCompare(x.last_at))[0];
    setSubj(stampSubject(t ? "Re: " + t.subject.replace(/^(re|fw|fwd)\s*:\s*/gi, "") : p.description || p.lead_name, p));
  }).catch(() => setSubj(stampSubject(p.description || p.lead_name, p))); }, [p.id, p.version]); // eslint-disable-line react-hooks/exhaustive-deps
  const body = () => text.trim() + (ref ? "\n\nProject ref: " + refLabel(p) : "");
  const draft = async () => {
    setErr(""); setOk(""); const win = window.open("", "_blank"); if (!win) return setErr(tr("הדפדפן חסם חלון — אפשר חלונות קופצים לאתר"));
    try {
      const m = splitMail("Subject: " + stampSubject(subj, p) + "\n\n" + body(), subj); await outlookDraft({ to, subject: m.subject, html: m.html }, win);
      onLog("✉ " + tr("טיוטה ללקוח") + ": " + m.subject); setOk("✓ " + tr("טיוטה מוכנה ב-Outlook"));
      if (mode === "quote") await onQuote("Q-" + p.id + "-v" + (p.version + 1));
    } catch (e) { try { win.close(); } catch { /* */ } setErr(e instanceof Error ? e.message : "error"); }
  };
  const ctx = () => ["Project " + refLabel(p), "Customer: " + p.lead_name + (lead?.contact_name ? " · contact " + lead.contact_name : ""), "Customer request: " + p.request, "Silitex answer (" + (a?.from || "") + ", " + fmtDateTime(a?.at) + "): " + JSON.stringify(a || {})].join("\n");
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold flex-1">✉ {tr("מייל ללקוח — עם מספר הפרויקט")}</h3>
        <button type="button" className={mode === "own" ? btnPrimary : btnGhost} onClick={() => setMode("own")}>✍ {tr("הטקסט שלי")}</button>
        <button type="button" className={mode === "quote" ? btnPrimary : btnGhost} disabled={!a} onClick={() => setMode("quote")} title={a ? "" : tr("מחכה לתשובת Silitex")}>✨ {tr("הצעה מתשובת Silitex")}</button></div>
      {a ? <div className="text-xs bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex flex-wrap gap-x-3 gap-y-1" dir="ltr"><b>🇮🇹 {a.from} · {fmtDateTime(a.at)}</b>{a.grade && <span>Grade {a.grade}</span>}{a.price && <span>{a.price} {a.currency}{a.unit ? "/" + a.unit : ""}</span>}{a.moq && <span>MOQ {a.moq}</span>}{a.lead_time && <span>LT {a.lead_time}</span>}{a.pack && <span>Pack {a.pack}</span>}{a.tds && <Badge tone="green">TDS</Badge>}{a.sds && <Badge tone="green">SDS</Badge>}{a.sample && <span>Sample {a.sample}</span>}{a.notes && <span className="w-full">{a.notes}</span>}</div>
        : <div className="text-xs text-slate-500">🇮🇹 {tr("עוד אין תשובת Silitex עם נתונים — כשתגיע, היא נקראת לבד ומופיעה כאן.")}</div>}
      {mode === "quote" && a && <AiPanel title={tr("טיוטת הצעה ללקוח")} buttonLabel={tr("כתוב הצעה")} lang="any" sessionTokens={spend.tokens} sessionCost={spend.cost} onUsage={(u: Usage) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} onResult={(t) => setText(t)}
        buildPrompt={() => ({ context: ctx(), prompt: "Write the e-mail BODY (no subject line, no Markdown) from Avshi Sapir (Sapirim — Silitex Israel) to this customer, in the customer's own language (English if they wrote English). Give ONLY the values in the Silitex answer (grade, price, unit, MOQ, lead time, pack, TDS/SDS, sample) — never invent or round a price. Terms: shipped direct from Italy per order, DDP Israel against an official PO; no local stock claims. Short, friendly, clear next step (sample / PO). Sign: Avshi Sapir · Sapirim — Silitex Israel · +972 50 523 1042 · avshi@sapirim.com" })} />}
      <label className="block text-xs text-slate-500">{tr("אל")}<input className={inputCls} dir="ltr" value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@company.com" /></label>
      <label className="block text-xs text-slate-500">{tr("נושא")}<input className={inputCls} dir="ltr" value={subj} onChange={(e) => setSubj(e.target.value)} /></label>
      <textarea className={inputCls + " leading-6"} dir="auto" rows={12} value={text} onChange={(e) => setText(e.target.value)} placeholder={tr("הדבק כאן את הטיוטה שלך…")} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ref} onChange={(e) => setRef(e.target.checked)} /> {tr("הוסף בסוף")}: <span dir="ltr" className="font-mono text-xs">Project ref: {refLabel(p)}</span></label>
      <div className="flex flex-wrap items-center gap-2"><button type="button" className={btnPrimary} disabled={!to || !text.trim()} onClick={draft}>📧 {tr("טיוטה ב-Outlook")}</button>{err && <span className="text-sm text-red-600">{err}</span>}{ok && <span className="text-sm text-emerald-700">{ok}</span>}</div>
      {text.trim() && <ExportBar title={stampSubject(subj, p)} text={body()} filename={p.id + "_mail"} />}
    </Card>
  );
}
