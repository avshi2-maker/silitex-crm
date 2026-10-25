"use client";
// SheetEmail.tsx (src/components/sheet/SheetEmail.tsx) · updated 25.10.2026 08:25 (Asia/Jerusalem) — + PDF attached (A4 landscape) · created 06:45 — ✉ send the meeting sheet by e-mail: To / CC, subject + short Hebrew body (editable), ✓ Excel attached, ✓ table inside the mail (prints from Outlook). PDF: print → Save as PDF (attach by hand).
import { useState } from "react";
import { useLang } from "@/i18n";
import { inputCls, btnPrimary, btnGhost } from "@/components/ui";

type Props = { head: string[]; rows: (string | number)[][]; ind: string; who: string; date: string; tons: number; onClose: () => void; makePdf: () => Promise<{ base64: string; filename: string }> };
export default function SheetEmail({ head, rows, ind, who, date, tons, onClose, makePdf }: Props) {
  const { t: tr } = useLang();
  const [to, setTo] = useState(""); const [cc, setCc] = useState("avshi@sapirim.com");
  const [subject, setSubject] = useState("דף פגישה — " + (ind || "כל התעשיות") + " — " + date);
  const [body, setBody] = useState("שלום " + who + ",\n\nמצורף דף הפגישה לתעשיית " + (ind || "כל התעשיות") + " — " + rows.length + " לקוחות, ~" + tons + " טון/שנה (הערכה), מסודר לפי עדיפות.\nלכל לקוח: מה מייצרים, הספק / המוצר הנוכחי והתאמת Silitex מסריקת האתר.\nנעבור עליו יחד — עמודת \"עדכון / הערות\" ריקה לסימון.\n\nבברכה,\nאבשי ספיר\nספירים — Silitex ישראל\n050-5231042");
  const [xl, setXl] = useState(true); const [pdf, setPdf] = useState(true); const [inBody, setInBody] = useState(true); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const send = async () => {
    setBusy(true); setMsg("");
    try {
      let xlsx = ""; const filename = "meeting_sheet_" + (ind || "all").replace(/\W+/g, "_") + "_" + date.replace(/\//g, "-") + ".xlsx";
      if (xl) { const X = await import("xlsx"); const ws = X.utils.aoa_to_sheet([head, ...rows]); ws["!cols"] = head.map((_, i) => ({ wch: [4, 34, 22, 40, 24, 36, 8, 8, 36][i] || 14 })); (ws as Record<string, unknown>)["!views"] = [{ RTL: true }]; const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, "Sheet"); xlsx = X.write(wb, { type: "base64", bookType: "xlsx" }); }
      const p = pdf ? await makePdf() : null;
      const r = await fetch("/api/sheet/email", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ to, cc, subject, body, head, rows, inBody, xlsx, filename, pdf: p?.base64 || "", pdfName: p?.filename || "" }) });
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
      <label className={lbl + " block"}>{tr("נושא")}<input className={inputCls + " mt-1"} value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
      <label className={lbl + " block"}>{tr("גוף המייל")}<textarea rows={8} className={inputCls + " mt-1"} value={body} onChange={(e) => setBody(e.target.value)} /></label>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-1"><input type="checkbox" checked={xl} onChange={(e) => setXl(e.target.checked)} />📎 {tr("Excel מצורף")}</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={inBody} onChange={(e) => setInBody(e.target.checked)} />📋 {tr("הטבלה בתוך המייל")}</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={pdf} onChange={(e) => setPdf(e.target.checked)} />📎 {tr("PDF מצורף")}</label>
        <button className={btnPrimary + " ms-auto"} disabled={busy || !to.trim()} onClick={send}>{busy ? "…" : "✉ " + tr("שלח")}</button>
        <a className={btnGhost} href={"mailto:" + encodeURIComponent(to) + "?cc=" + encodeURIComponent(cc) + "&subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body)}>{tr("פתח ב-Outlook")}</a>
      </div>
      {msg && <div className={"text-sm " + (msg.startsWith("✓") ? "text-emerald-700" : "text-red-600")}>{msg}</div>}
    </div>
  );
}
