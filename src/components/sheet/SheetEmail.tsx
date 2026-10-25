"use client";
// SheetEmail.tsx (src/components/sheet/SheetEmail.tsx) · updated 25.10.2026 10:00 (Asia/Jerusalem) — v0.92.2 "To" auto-filled from saved contacts (name in "meeting with") + one-click contact chips · v0.92.1 📧 Outlook draft (.eml) with PDF + Excel attached, Hebrew-safe (replaces the mailto link that garbled Hebrew and could not attach) · 08:25 — + PDF attached (A4 landscape) · created 06:45 — ✉ send the meeting sheet by e-mail: To / CC, subject + short Hebrew body (editable), ✓ Excel attached, ✓ table inside the mail (prints from Outlook). PDF: print → Save as PDF (attach by hand).
import { useState } from "react";
import { useLang } from "@/i18n";
import { inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { sheetXlsx } from "@/lib/sheet-files";
import { downloadEml, type EmlFile } from "@/lib/eml";
import { sheetMailHtml } from "@/lib/sheet-mail";

type Props = { head: string[]; rows: (string | number)[][]; ind: string; who: string; people?: { name: string; email: string }[]; date: string; tons: number; onClose: () => void; makePdf: () => Promise<{ base64: string; filename: string }> };
export default function SheetEmail({ head, rows, ind, who, people = [], date, tons, onClose, makePdf }: Props) {
  const { t: tr } = useLang();
  const w = who.trim().split(/\s+/)[0] || "-"; const match = people.find((p) => p.name.includes(w));
  const [to, setTo] = useState(match?.email || ""); const [cc, setCc] = useState("avshi@sapirim.com");
  const [subject, setSubject] = useState("דף פגישה — " + (ind || "כל התעשיות") + " — " + date);
  const [body, setBody] = useState("שלום " + who + ",\n\nמצורף דף הפגישה לתעשיית " + (ind || "כל התעשיות") + " — " + rows.length + " לקוחות, ~" + tons + " טון/שנה (הערכה), מסודר לפי עדיפות.\nלכל לקוח: מה מייצרים, הספק / המוצר הנוכחי והתאמת Silitex מסריקת האתר.\nנעבור עליו יחד — עמודת \"עדכון / הערות\" ריקה לסימון.\n\nבברכה,\nאבשי ספיר\nספירים — Silitex ישראל\n050-5231042");
  const [xl, setXl] = useState(true); const [pdf, setPdf] = useState(true); const [inBody, setInBody] = useState(true); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const base = "meeting_sheet_" + (ind || "all").replace(/\W+/g, "_") + "_" + date.replace(/\//g, "-");
  const files = async () => {
    const out: EmlFile[] = [];
    if (pdf) { const p = await makePdf(); out.push({ filename: p.filename, base64: p.base64, type: "application/pdf" }); }
    if (xl) { const x = await sheetXlsx(head, rows, base + ".xlsx"); out.push({ filename: x.filename, base64: x.base64, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }); }
    return out;
  };
  const outlook = async () => {
    setBusy(true); setMsg("");
    try { downloadEml({ to, cc, subject, text: body, html: sheetMailHtml(body, head, rows, inBody), files: await files() }, subject); setMsg("✓ " + tr("הקובץ ירד — לחיצה כפולה עליו פותחת טיוטה ב-Outlook עם הקבצים, ואז שלח")); }
    catch { setMsg("⚠ " + tr("יצירת הטיוטה נכשלה")); }
    setBusy(false);
  };
  const send = async () => {
    setBusy(true); setMsg("");
    try {
      const f = await files(); const p = f.find((x) => x.type === "application/pdf"); const x = f.find((y) => y.filename.endsWith(".xlsx"));
      const r = await fetch("/api/sheet/email", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ to, cc, subject, body, head, rows, inBody, xlsx: x?.base64 || "", filename: x?.filename || "", pdf: p?.base64 || "", pdfName: p?.filename || "" }) });
      const j = await r.json().catch(() => ({})); setMsg(r.ok ? "✓ " + tr("נשלח") : "⚠ " + (j.error || tr("השליחה נכשלה")));
    } catch { setMsg("⚠ " + tr("השליחה נכשלה")); }
    setBusy(false);
  };
  const lbl = "text-xs text-slate-500";
  return (
    <div className="border-2 border-brand-100 rounded-xl p-3 space-y-2 bg-white">
      <div className="flex items-center justify-between"><b>✉ {tr("שליחת הדף במייל")}</b><button className="text-slate-500" onClick={onClose} aria-label={tr("סגור")}>✕</button></div>
      <div className="grid md:grid-cols-2 gap-2">
        <label className={lbl}>{tr("אל")}<input dir="ltr" className={inputCls + " mt-1"} value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@company.com" /></label>
        <label className={lbl}>{tr("עותק (CC)")}<input dir="ltr" className={inputCls + " mt-1"} value={cc} onChange={(e) => setCc(e.target.value)} /></label>
      </div>
      {people.length > 0 && <div className="flex flex-wrap gap-1 text-xs">{people.map((p, i) => <button key={i} type="button" className={"px-2 py-0.5 rounded-full border " + (to.includes(p.email) ? "bg-brand-50 border-brand-500" : "bg-white")} onClick={() => setTo((t) => t.includes(p.email) ? t : (t.trim() ? t.trim() + "; " : "") + p.email)}>+ {p.name}</button>)}</div>}
      <label className={lbl + " block"}>{tr("נושא")}<input className={inputCls + " mt-1"} value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
      <label className={lbl + " block"}>{tr("גוף המייל")}<textarea rows={8} className={inputCls + " mt-1"} value={body} onChange={(e) => setBody(e.target.value)} /></label>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-1"><input type="checkbox" checked={xl} onChange={(e) => setXl(e.target.checked)} />📎 {tr("Excel מצורף")}</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={inBody} onChange={(e) => setInBody(e.target.checked)} />📋 {tr("הטבלה בתוך המייל")}</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={pdf} onChange={(e) => setPdf(e.target.checked)} />📎 {tr("PDF מצורף")}</label>
        <button className={btnPrimary + " ms-auto"} disabled={busy} onClick={outlook}>{busy ? "…" : "📧 " + tr("טיוטה ל-Outlook")}</button>
        <button className={btnGhost} disabled={busy || !to.trim()} onClick={send} title={tr("שליחה ישירה מהשרת")}>{busy ? "…" : "✉ " + tr("שלח ישירות")}</button>
      </div>
      {msg && <div className={"text-sm " + (msg.startsWith("✓") ? "text-emerald-700" : "text-red-600")}>{msg}</div>}
    </div>
  );
}
