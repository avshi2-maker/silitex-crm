"use client";
// ExportBar.tsx (src/components/ExportBar.tsx) · updated 23.11.2026 10:35 (Asia/Jerusalem) — optional onSave/saveLabel/onPrint (orders: 💾 = the real PDF form) · 09.10.2026 10:30
// Standing 5-button export bar: Print / Outlook / Gmail / WhatsApp / Save. Attach under every AI output.
import { useState } from "react";
import { useLang } from "@/i18n";
type Props = { title: string; text: string; filename?: string; onSave?: () => void; saveLabel?: string; onPrint?: () => void };
export default function ExportBar({ title, text, filename, onSave, saveLabel, onPrint }: Props) {
  const { t: tr } = useLang();
  const [saved, setSaved] = useState(false);
  const enc = encodeURIComponent;
  const body = title + "\n\n" + text;
  const print = () => {
    if (onPrint) { onPrint(); return; }
    const w = window.open("", "_blank"); if (!w) return;
    w.document.write("<html dir='rtl'><head><meta charset='utf-8'><title>" + title + "</title><style>body{font-family:Arial;padding:24px;white-space:pre-wrap;line-height:1.6}</style></head><body><h2>" + title + "</h2>" + text.replace(/</g, "&lt;") + "</body></html>");
    w.document.close(); w.focus(); w.print();
  };
  const save = () => {
    if (onSave) { onSave(); return; }
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = (filename || title) + ".txt"; a.click();
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };
  const btn = "px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-slate-50 transition";
  return (
    <div className="flex flex-wrap gap-2 mt-3 print:hidden">
      <button className={btn} onClick={print}>{tr("🖨️ הדפסה")}</button>
      <a className={btn} href={"mailto:?subject=" + enc(title) + "&body=" + enc(body)}>📧 Outlook</a>
      <a className={btn} target="_blank" rel="noreferrer" href={"https://mail.google.com/mail/?view=cm&su=" + enc(title) + "&body=" + enc(body)}>✉️ Gmail</a>
      <a className={btn} target="_blank" rel="noreferrer" href={"https://wa.me/?text=" + enc(body)}>💬 WhatsApp</a>
      <button className={btn} onClick={save}>{saved ? tr("✓ נשמר") : saveLabel || tr("💾 שמירה")}</button>
    </div>
  );
}
