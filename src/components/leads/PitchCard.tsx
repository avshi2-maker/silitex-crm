"use client";
// PitchCard.tsx (src/components/leads/PitchCard.tsx) · updated 08.11.2026 13:20 (Asia/Jerusalem) — v1.7.4 green line "✓ answered dd/mm hh:mm" under the customer request (your reply from Outlook) · 08.11.2026 07:10 — v1.6.0 after the Outlook draft: the answer is saved on the customer (quoted in the Silitex request) + 🔔 follow-up task in N days · created 08.11.2026 06:40 — v1.5.0
// 📧 Pitch / first offer on the customer page. Two modes:
//  • 📨 reply to the customer's own e-mail (from Outlook / Hub) — answers their exact request point by point, no prices, no unapproved substitutes
//  • 🌐 first contact from the website scan — Avshi's approved template
// 📎 data sheets (catalogue PDFs + your own TDS / SDS) → editable text → Outlook draft WITH the files (you press Send). Token meter + export bar.
import { useEffect, useMemo, useState } from "react";
import { Card, btnPrimary, btnGhost, inputCls } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import PitchFiles, { type PitchFile } from "./PitchFiles";
import { mailsFor, pdfsFor, pdfUrl, rowsInText, type CustomerMail } from "@/lib/pitch-data";
import { webContext, webPrompt, replyContext, replyPrompt } from "@/prompts/pitch";
import { scanOf } from "@/lib/scan";
import { allPeople } from "@/lib/people";
import { outlookDraft, type DraftFile } from "@/lib/outlook-draft";
import { mailDoc, textToHtml } from "@/lib/eml";
import { todayIso, fmtDateTime } from "@/lib/format";
import { followDays } from "@/lib/followup";
import { useLang } from "@/i18n";
import type { Lead, Product, Usage, Doc, HubMsg, Thread } from "@/lib/types";

export type Drafted = { subject: string; text: string; files: string[]; days: number };
type Props = { lead: Lead; matches: Product[]; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void; addActivity: (id: string, kind: string, text: string) => void; addDoc: (d: Omit<Doc, "id">) => void; onDrafted?: (d: Drafted) => void };
type Mode = "reply" | "web";
const b64 = async (url: string) => { const b = new Uint8Array(await (await fetch(url)).arrayBuffer()); let s = ""; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s); };

export default function PitchCard({ lead, matches, spend, addSpend, addActivity, addDoc, onDrafted }: Props) {
  const { t: tr } = useLang();
  const [mails, setMails] = useState<CustomerMail[]>([]); const [lastReply, setLastReply] = useState(""); const [replyAt, setReplyAt] = useState("");
  const [mode, setMode] = useState<Mode>("web"); const [files, setFiles] = useState<PitchFile[]>([]);
  const [text, setText] = useState(""); const [usage, setUsage] = useState<Usage | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [ok, setOk] = useState(""); const [days, setDays] = useState(5);
  useEffect(() => { setDays(followDays()); }, []);
  const people = allPeople(lead); const contact = people[0]?.name && people[0].name !== lead.name ? people[0].name : "";
  useEffect(() => { fetch("/api/hub/ingest", { cache: "no-store" }).then((r) => r.json()).then((j) => { const m = mailsFor(lead.id, (j.threads || []) as Thread[], (j.msgs || []) as HubMsg[]); setMails(m.inbound); setLastReply(m.lastReply); setReplyAt(m.lastReplyAt); if (m.inbound.length) setMode("reply"); }).catch(() => {}); }, [lead.id]);
  const names = useMemo(() => mode === "reply" ? rowsInText(mails.slice(-2).map((m) => m.subject + " " + m.body).join(" ")).cat.map((r) => r.product) : [...(scanOf(lead)?.data.matches || []).map((m) => m.silitex), ...matches.map((p) => p.product_name)], [mode, mails, lead, matches]);
  useEffect(() => { setFiles((cur) => [...pdfsFor(names, lead.industry).map((n) => ({ name: n, kind: "catalogue" as const, on: true })), ...cur.filter((f) => f.kind === "upload")]); }, [names, lead.industry]);
  const att = files.filter((f) => f.on).map((f) => f.name);

  const run = async () => {
    setBusy(true); setErr(""); setOk("");
    try {
      const body = mode === "reply" ? { context: replyContext(lead, mails, lastReply, att), prompt: replyPrompt(), lang: "any" } : { context: webContext(lead, matches, contact, att), prompt: webPrompt(lead, contact), lang: "he" };
      const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, maxTokens: 1500 }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "error");
      setText(String(j.text || "").replace(/\*\*/g, "").trim()); setUsage(j.usage); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd);
      addActivity(lead.id, "ai", mode === "reply" ? tr("נוצרה תשובה AI למייל הלקוח") : tr("נוצר פיץ' AI"));
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : tr("שגיאה")); }
    setBusy(false);
  };

  const draft = async () => {
    const win = window.open("", "_blank"); if (!win) return setErr(tr("הדפדפן חסם חלון — אפשר חלונות קופצים לאתר"));
    setErr(""); setOk("");
    try {
      const lines = text.split("\n"); const sm = lines[0].match(/^\s*(Subject|נושא)\s*:\s*(.*)$/i);
      const subject = sm ? sm[2].trim() : (mode === "reply" ? "Re: " + (mails[mails.length - 1]?.subject || lead.name) : "Silitex · " + lead.name);
      const bodyTxt = (sm ? lines.slice(1) : lines).join("\n").trim(); const rtl = /[֐-׿]/.test(bodyTxt);
      const to = (mode === "reply" && mails[mails.length - 1]?.from) || lead.contact_email || people.find((p) => p.email)?.email || "";
      const out: DraftFile[] = [];
      for (const f of files.filter((x) => x.on)) out.push(f.file || { filename: f.name, base64: await b64(pdfUrl(f.name)), type: "application/pdf" });
      const html = rtl ? mailDoc(textToHtml(bodyTxt)) : mailDoc(textToHtml(bodyTxt)).replace(/dir="rtl"/g, 'dir="ltr"').replace('lang="he"', 'lang="en"').replace("direction:rtl;text-align:right", "direction:ltr;text-align:left");
      await outlookDraft({ to, subject, html, files: out }, win);
      addActivity(lead.id, "mail", tr("טיוטת Outlook נוצרה") + ": " + subject + (out.length ? " · 📎 " + out.length : ""));
      files.filter((x) => x.on).forEach((f) => addDoc({ lead_id: lead.id, lead_name: lead.name, kind: f.kind === "upload" ? "tds" : "other", title: f.name + " (" + tr("טיוטה") + ")", sent_at: todayIso(), via: "Outlook", status: "sent" }));
      onDrafted?.({ subject, text: bodyTxt, files: files.filter((x) => x.on).map((x) => x.name), days });
      setOk("✓ " + tr("הטיוטה מוכנה ב-Outlook עם הקבצים — בדוק ולחץ Send") + (days ? " · 🔔 " + tr("מעקב בעוד") + " " + days + " " + tr("ימים") : ""));
    } catch (e: unknown) { try { win.close(); } catch { /* */ } setErr(e instanceof Error ? e.message : tr("שגיאה")); }
  };

  const tab = (m: Mode, label: string, dis = false) => <button type="button" disabled={dis} onClick={() => { setMode(m); setText(""); }} className={"text-xs px-2 py-1 rounded-full border disabled:opacity-40 " + (mode === m ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{label}</button>;
  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap"><h3 className="font-bold">📧 {tr("פיץ' / הצעה ראשונה ל-")}{lead.name}</h3><button className={btnPrimary + (!text && !busy ? " ai-pulse" : "")} onClick={run} disabled={busy}>{busy ? tr("מעבד…") : "✨ " + (mode === "reply" ? tr("צור תשובה למייל") : tr("צור פיץ' עם AI"))}</button></div>
        <div className="flex gap-1 flex-wrap">{tab("reply", "📨 " + tr("תשובה למייל הלקוח") + " (" + mails.length + ")", !mails.length)}{tab("web", "🌐 " + tr("פנייה ראשונה לפי האתר"))}</div>
        {mode === "reply" && mails.length > 0 && <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-2"><b>{tr("בקשת הלקוח")}:</b> {mails[mails.length - 1].subject} <span className="text-slate-500" dir="ltr">· {mails[mails.length - 1].from}</span><div className="text-slate-600 mt-1 line-clamp-3 whitespace-pre-wrap" dir="auto">{mails[mails.length - 1].body.slice(0, 400)}</div>{replyAt > mails[mails.length - 1].at && <div className="text-emerald-700 mt-1 font-medium">✓ {tr("ענית ללקוח")} · {fmtDateTime(replyAt)} — {tr("ההתכתבות המלאה: 📬 התכתבות ביומן הפעילות")}</div>}<div className="text-slate-500 mt-1">{tr("ה-AI עונה על כל סעיף בבקשה. מחיר / MOQ / מלאי / זמן אספקה — ״הצעה רשמית תישלח לאחר אישור Silitex״ (אין מחירון עדיין).")}</div></div>}
        <PitchFiles files={files} setFiles={setFiles} />
        <TokenMeter usage={usage} sessionTokens={spend.tokens} sessionCost={spend.cost} busy={busy} />
        {err && <div className="text-sm text-red-600">{err}</div>}
        {text && <>
          <textarea className={inputCls + " leading-6"} rows={16} dir="auto" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex items-center gap-2 flex-wrap"><button className={btnPrimary} onClick={draft}>📧 {tr("טיוטה ב-Outlook עם הקבצים")} ({att.length})</button><label className="text-xs text-slate-500 flex items-center gap-1">🔔 {tr("מעקב אם אין תשובה")}<select className={inputCls + " !w-auto !py-1"} value={days} onChange={(e) => setDays(Number(e.target.value))}><option value={0}>{tr("בלי")}</option>{[2, 3, 5, 7, 10, 14].map((n) => <option key={n} value={n}>{n} {tr("ימים")}</option>)}</select></label><button className={btnGhost} onClick={run} disabled={busy}>↻ {tr("צור מחדש")}</button>{ok && <span className="text-xs text-emerald-700">{ok}</span>}</div>
          <ExportBar title={"Pitch — " + lead.name} text={text} />
        </>}
      </div>
    </Card>
  );
}
