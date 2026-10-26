"use client";
// page.tsx (src/app/brief/page.tsx) · updated 26.10.2026 07:20 (Asia/Jerusalem) — v0.97.0 real delivery report from Meta (✅ delivered / ❌ failed) after send · 09.10.2026 12:30 — daily brief: run now, send to WhatsApp
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, H1, Badge, btnPrimary, btnGhost } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { fmtDate } from "@/lib/format";
import type { Usage } from "@/lib/types";
import { useLang } from "@/i18n";
type R = { text: string; usage: Usage; source: string; delivery?: { sent: boolean; provider: string; link: string; error?: string } };
export default function BriefPage() {
  const { t: tr, lang } = useLang();
  const { state, ready, addSpend } = useStore();
  const [busy, setBusy] = useState(false); const [r, setR] = useState<R | null>(null); const [err, setErr] = useState(""); const [dl, setDl] = useState("");
  if (!ready) return null;
  const run = async (send: boolean) => {
    setBusy(true); setErr("");
    try { const res = await fetch("/api/brief", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ send, lang }) }); const j = await res.json(); if (!res.ok) throw new Error(j.error); setR(j); addSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd);
      if (send && j.delivery?.sent) { const t0 = Date.now(); setDl("⏳ " + tr("מחכה לאישור מסירה מ-Meta…")); const poll = async () => { const s = await fetch("/api/brief", { cache: "no-store" }).then((x) => x.json()).catch(() => ({})); if (s.at && new Date(s.at).getTime() >= t0 - 5000 && /✅|❌/.test(s.status || "")) { setDl(s.status); return; } if (Date.now() - t0 < 60000) setTimeout(poll, 3000); else setDl("⚠ " + tr("אין אישור מסירה תוך דקה — בדוק בטלפון")); }; setTimeout(poll, 3000); } }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : tr("שגיאה")); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <H1 sub={tr("בוט בוקר: כל יום 07:00 ה-AI מסכם את 5 השיחות החשובות ושולח ל-WhatsApp. כאן אפשר להריץ ידנית.")}>{tr("תדריך יומי — ")}{fmtDate(new Date())}</H1>
      <Card className="flex flex-wrap gap-2 items-center">
        <button className={btnPrimary} disabled={busy} onClick={() => run(false)}>{busy ? tr("מעבד…") : tr("צור תדריך עכשיו")}</button>
        <button className={btnGhost} disabled={busy} onClick={() => run(true)}>{tr("צור ושלח ל-WhatsApp (בוט)")}</button>
        {r && <Badge tone={r.source === "supabase" ? "green" : "amber"}>{r.source === "supabase" ? tr("נתונים: Supabase") : tr("נתונים: seed (ללא Supabase)")}</Badge>}
        {r?.delivery && <Badge tone={r.delivery.sent ? "green" : "red"}>{r.delivery.sent ? tr("נשלח · ") + r.delivery.provider : r.delivery.provider === "none" ? tr("לא נשלח — אין ספק WhatsApp מוגדר; השתמש בכפתור WhatsApp למטה") : tr("נדחה ע״י Meta") + ": " + (r.delivery.error || "").slice(0, 160)}</Badge>}
        {dl && <Badge tone={dl.startsWith("✅") ? "green" : dl.startsWith("❌") ? "red" : "amber"}>{dl.replace(/→ \d+/, "")}</Badge>}
      </Card>
      <TokenMeter usage={r?.usage} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} busy={busy} />
      {err && <div className="text-sm text-red-600">{err}</div>}
      {r && (<Card><pre className="whitespace-pre-wrap text-sm leading-6 font-[inherit]">{r.text}</pre><ExportBar title={tr("תדריך יומי ") + fmtDate(new Date())} text={r.text} /></Card>)}
      <details className="text-xs text-slate-500 leading-5 print:hidden"><summary className="cursor-pointer">⚙</summary>
        <b>{tr("הפעלת הבוט:")}</b>{tr(" Vercel cron מוגדר ב-vercel.json (04:00 UTC = 07:00 ישראל). משתני סביבה: ")}<code>CRON_SECRET</code>{tr(" (Vercel מוסיף אוטומטית), ")}<code>BRIEF_TO_WHATSAPP</code>{tr(" (972…), ושולח: Twilio (")}<code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>, <code>TWILIO_WHATSAPP_FROM</code>{tr(") או webhook כללי (")}<code>WHATSAPP_WEBHOOK_URL</code>). ללא ספק — התדריך נוצר ומחכה כאן.
      </details>
    </div>
  );
}
