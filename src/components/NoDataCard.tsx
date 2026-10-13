"use client";
// NoDataCard.tsx (src/components/NoDataCard.tsx) · updated 13.10.2026 08:15 (Asia/Jerusalem) — shown on /ask when the sources do not cover the question (0 hits, or the AI answered NO_DATA). No guessing, no outside sources: one button sends the question to Avshi by email + WhatsApp (24h human answer).
import { useState } from "react";
import { Card, btnPrimary } from "@/components/ui";
import { useLang } from "@/i18n";
export default function NoDataCard({ question, reason }: { question: string; reason?: string }) {
  const { t: tr, lang } = useLang();
  const [note, setNote] = useState(""); const [state, setState] = useState<"" | "busy" | "ok" | "err">("");
  const send = async () => { setState("busy"); try { const r = await fetch("/api/partner/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, note, page: "/ask", lang }) }); setState(r.ok ? "ok" : "err"); } catch { setState("err"); } };
  return (
    <Card className="border-amber-300 bg-amber-50/60 text-sm space-y-2">
      <div className="font-bold">🛑 {tr("לא נמצא במאגר Silitex — לא ננחש")}</div>
      <div className="text-slate-700">{tr("המערכת עונה רק מתוך הקטלוגים, המקבילות וה-FAQ של Silitex. כשאין מקור — אין תשובה אוטומטית, ואין פנייה למקורות חיצוניים. במקום זה: שאלה ישירה לאבשי (מייל + WhatsApp), תשובה אנושית תוך 24 שעות.")}</div>
      {reason && <div className="text-xs text-slate-500">{reason}</div>}
      <div className="bg-white border rounded-lg p-2"><div className="text-xs text-slate-500">{tr("השאלה:")}</div><div dir="auto">{question}</div></div>
      {state !== "ok" && <textarea className="w-full border rounded-lg px-3 py-2 bg-white" placeholder={tr("פרט (לא חובה): לקוח, יישום, מה חיפשת…")} value={note} onChange={(e) => setNote(e.target.value)} />}
      {state === "ok" ? <div className="text-emerald-700 font-medium">✓ {tr("נשלח לאבשי במייל וב-WhatsApp. תשובה אנושית תוך 24 שעות.")}</div> : <button className={btnPrimary} disabled={state === "busy"} onClick={send}>{state === "busy" ? tr("שולח…") : "📨 " + tr("שלח לאבשי — תמיכה אנושית")}</button>}
      {state === "err" && <div className="text-red-600 text-xs">{tr("השליחה נכשלה — כתבו ל-avshi@sapirim.com")}</div>}
    </Card>
  );
}
