"use client";
// ExportBar.tsx (src/components/ExportBar.tsx) · updated 09.10.2026 09:10 (Asia/Jerusalem)
// Standing 5-button export bar: Print / Outlook / Gmail / WhatsApp / Save. Attach under every AI output.
import { useState } from "react";
type Props = { title: string; text: string; filename?: string };
export default function ExportBar({ title, text, filename }: Props) {
  const [saved, setSaved] = useState(false);
  const enc = encodeURIComponent;
  const body = title + "\n\n" + text;
  const print = () => {
    const w = window.open("", "_blank"); if (!w) return;
    w.document.write("<html dir='rtl'><head><meta charset='utf-8'><title>" + title + "</title><style>body{font-family:Arial;padding:24px;white-space:pre-wrap;line-height:1.6}</style></head><body><h2>" + title + "</h2>" + text.replace(/</g, "&lt;") + "</body></html>");
    w.document.close(); w.focus(); w.print();
  };
  const save = () => {
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = (filename || title) + ".txt"; a.click();
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };
  const btn = "px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-slate-50 transition";
  return (
    <div className="flex flex-wrap gap-2 mt-3 print:hidden">
      <button className={btn} onClick={print}>🖨️ הדפסה</button>
      <a className={btn} href={"mailto:?subject=" + enc(title) + "&body=" + enc(body)}>📧 Outlook</a>
      <a className={btn} target="_blank" rel="noreferrer" href={"https://mail.google.com/mail/?view=cm&su=" + enc(title) + "&body=" + enc(body)}>✉️ Gmail</a>
      <a className={btn} target="_blank" rel="noreferrer" href={"https://wa.me/?text=" + enc(body)}>💬 WhatsApp</a>
      <button className={btn} onClick={save}>{saved ? "✓ נשמר" : "💾 שמירה"}</button>
    </div>
  );
}
