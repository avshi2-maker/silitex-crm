"use client";
// ExpoSend.tsx (src/components/expo/ExpoSend.tsx) · updated 18.10.2026 12:55 (Asia/Jerusalem) — + 📤 Share Excel (phone Share menu → Outlook, file attached, her own account) · 12:45 — EXPO "send my session": pick period (today / last 7 days / all) → ✉️ one tap e-mails a formatted report + Excel (CSV) to her own address (Resend, server keeps nothing) · 📧 Outlook button opens the Outlook app with the summary ready · ⬇️ Excel + 5-button export bar.
import { useState } from "react";
import ExportBar from "@/components/ExportBar";
import { inputCls } from "@/components/ui";
import { fmtDate, todayIso, addDays } from "@/lib/format";
import { meetingsCsv, meetingsText, download } from "@/lib/expo/util";
import type { Expo } from "@/lib/expo/store";
import { useLang } from "@/i18n";
const PERIODS = [["today", "היום"], ["week", "7 הימים האחרונים"], ["all", "הכל"]] as const;
export default function ExpoSend({ expo }: { expo: Expo }) {
  const { t: tr, lang } = useLang();
  const { state } = expo; const p = state.profile;
  const [period, setPeriod] = useState<string>("week"); const [to, setTo] = useState(p.email || "");
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const today = todayIso(); const from = period === "today" ? today : period === "week" ? addDays(today, -6) : "";
  const ms = state.meetings.filter((m) => !from || m.at.slice(0, 10) >= from);
  const label = tr(PERIODS.find((x) => x[0] === period)?.[1] || "") + (from ? " · " + fmtDate(from) + (from !== today ? " – " + fmtDate(today) : "") : "");
  const stamp = today.split("-").reverse().join("-");
  const subject = "Silitex Expo — " + label;
  const body = meetingsText(ms.map((m) => ({ ...m, industry: m.industry ? tr(m.industry) : "" })));
  const outlook = "ms-outlook://compose?to=" + encodeURIComponent(to) + "&subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body.slice(0, 6000));
  const send = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/expo/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to, lang, period: label, profile: p, meetings: ms.map((m) => ({ ...m, industry: m.industry ? tr(m.industry) : "" })) }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) setMsg({ ok: true, text: tr("נשלח ✓ — בדקי את תיבת הדואר (גם ספאם).") + " " + to });
      else setMsg({ ok: false, text: (j.code === "domain" || j.code === "no_key" ? tr("שירות המייל עוד לא הופעל — השתמשי בכפתור Outlook.") : j.code === "bad_to" ? tr("כתובת מייל לא תקינה") : tr("השליחה נכשלה — השתמשי בכפתור Outlook.")) + (j.code === "domain" || j.code === "no_key" || j.code === "bad_to" ? "" : " (" + (j.error || r.status) + ")") });
    } catch { setMsg({ ok: false, text: tr("אין קליטה — נסי שוב כשיש רשת, או השתמשי בכפתור Outlook.") }); }
    setBusy(false);
  };
  // Phone Share menu with the Excel file attached → she picks Outlook → sends from her own account (no domain, no server). Fallback: download.
  const shareExcel = async () => {
    const name = "Silitex_Expo_" + stamp + ".csv"; const f = new File([meetingsCsv(ms, tr)], name, { type: "text/csv" });
    const n = navigator as Navigator & { canShare?: (d: unknown) => boolean };
    if (n.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: subject, text: subject }); return; } catch (e) { if (e instanceof Error && e.name === "AbortError") return; } }
    download(name, meetingsCsv(ms, tr), "text/csv;charset=utf-8"); setMsg({ ok: true, text: tr("הקובץ נשמר בטלפון — צרפי אותו למייל ב-Outlook.") });
  };
  const chip = (on: boolean) => "flex-1 py-2 rounded-lg border text-sm " + (on ? "bg-brand-500 text-white border-brand-500" : "bg-white");
  return (
    <div className="bg-white border rounded-2xl p-3 space-y-2">
      <div className="font-bold">✉️ {tr("שלח את הסשן למייל שלי")}</div>
      <div className="flex gap-2">{PERIODS.map(([k, he]) => <button key={k} className={chip(period === k)} onClick={() => setPeriod(k)}>{tr(he)}</button>)}</div>
      <div className="text-xs text-slate-500">{ms.length} {tr("פגישות")} · {label}</div>
      <input className={inputCls + " text-base"} type="email" dir="ltr" placeholder="name@silitex.it" value={to} onChange={(e) => setTo(e.target.value)} />
      <button className="w-full py-3 rounded-xl bg-brand-500 text-white disabled:opacity-40" disabled={busy || !ms.length || !to.includes("@")} onClick={send}>{busy ? tr("שולח…") : "✉️ " + tr("שלח דוח מעוצב + Excel")}</button>
      <div className="grid grid-cols-2 gap-2">
        <a className={"flex items-center justify-center text-center py-3 rounded-xl border-2 border-[#0a64ad] text-[#0a64ad] font-medium" + (ms.length ? "" : " pointer-events-none opacity-40")} href={outlook}>📧 {tr("פתח ב-Outlook")}</a>
        <button className="py-3 rounded-xl border-2 border-[#0a64ad] bg-[#0a64ad] text-white font-medium disabled:opacity-40" disabled={!ms.length} onClick={shareExcel}>📤 {tr("שתף Excel")}</button>
      </div>
      <div className="text-[11px] text-slate-500">{tr("בלי הגדרות: Outlook = הטקסט של הפגישות · שתף Excel → בחרי Outlook = הקובץ מצורף. נשלח מהחשבון שלך.")}</div>
      {msg && <div className={"text-sm rounded-lg p-2 " + (msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900")}>{msg.text}</div>}
      <div className="border-t pt-2 space-y-2">
        <button className="w-full py-2 rounded-xl border" disabled={!ms.length} onClick={() => download("Silitex_Expo_" + stamp + ".csv", meetingsCsv(ms, tr), "text/csv;charset=utf-8")}>⬇️ Excel (CSV)</button>
        <ExportBar title={subject} text={body} filename={"Silitex_Expo_" + stamp + ".txt"} />
      </div>
    </div>
  );
}
