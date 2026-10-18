"use client";
// ExpoList.tsx (src/components/expo/ExpoList.tsx) · updated 18.10.2026 11:50 (Asia/Jerusalem) — EXPO contacts & tasks: every meeting of the show in one list (search, call / WhatsApp / mail, ✨ summarize later), open next steps with ✓, export → Excel (CSV) + 5-button export bar. Phone-only data.
import { useState } from "react";
import ExportBar from "@/components/ExportBar";
import { inputCls } from "@/components/ui";
import { fmtDate, todayIso, addDays } from "@/lib/format";
import { meetingsCsv, meetingsText, download, waNumber } from "@/lib/expo/util";
import { expoSummarize } from "./ExpoMeet";
import type { Expo, ExpoMeeting } from "@/lib/expo/store";
import { useLang } from "@/i18n";
export default function ExpoList({ expo }: { expo: Expo }) {
  const { t: tr, lang } = useLang();
  const { state, patchMeeting, removeMeeting } = expo; const ms = state.meetings;
  const [q, setQ] = useState(""); const [open, setOpen] = useState(""); const [busy, setBusy] = useState(""); const [arm, setArm] = useState(""); const [err, setErr] = useState("");
  const today = todayIso();
  const tasks = ms.filter((m) => m.next_step && !m.done).sort((a, b) => (a.due || "9").localeCompare(b.due || "9"));
  const shown = q.trim() ? ms.filter((m) => (m.company + " " + m.contact_name + " " + m.note + " " + m.summary).toLowerCase().includes(q.trim().toLowerCase())) : ms;
  const later = async (m: ExpoMeeting) => {
    setBusy(m.id); setErr("");
    try { const { sum } = await expoSummarize(expo, { company: m.company, contact: m.contact_name, industry: m.industry, note: m.note }, lang); patchMeeting(m.id, { summary: sum.summary || "", products: sum.products || [], next_step: sum.next_step || m.next_step, due: sum.next_step ? addDays(todayIso(), Math.min(30, Math.max(1, Number(sum.due_days) || 3))) : m.due, followup: sum.followup_message || m.followup }); }
    catch (e) { setErr(tr("AI לא זמין (אין קליטה?) — אפשר לשמור את ההערה כמו שהיא. ") + (e instanceof Error ? e.message : "")); }
    setBusy("");
  };
  const btn = "px-3 py-2 rounded-lg border text-sm";
  const stamp = today.split("-").reverse().join("-");
  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-2xl p-3 flex justify-around text-center">
        <div><div className="text-2xl font-bold">{ms.length}</div><div className="text-xs text-slate-500">{tr("אנשי קשר")}</div></div>
        <div><div className="text-2xl font-bold text-brand-600">{tasks.length}</div><div className="text-xs text-slate-500">{tr("משימות פתוחות")}</div></div>
        <div><div className="text-2xl font-bold">{ms.filter((m) => !m.summary && m.note).length}</div><div className="text-xs text-slate-500">{tr("לסכם")}</div></div>
      </div>
      {tasks.length > 0 && (
        <div className="bg-white border rounded-2xl p-3">
          <div className="font-bold mb-1">✅ {tr("משימות פתוחות")}</div>
          <ul className="divide-y">{tasks.map((m) => (
            <li key={m.id} className="py-2 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 w-5 h-5" onChange={() => patchMeeting(m.id, { done: true })} /><div className="flex-1"><div className="font-medium" dir="auto">{m.next_step}</div><div className="text-xs text-slate-500">{m.company} · <span className={m.due && m.due < today ? "text-red-600" : ""}>{fmtDate(m.due)}</span></div></div></li>
          ))}</ul>
        </div>
      )}
      <input className={inputCls + " text-base"} placeholder={"🔎 " + tr("חיפוש איש קשר / חברה")} value={q} onChange={(e) => setQ(e.target.value)} />
      {err && <div className="text-sm text-red-600">{err}</div>}
      {ms.length === 0 && <div className="text-center text-slate-500 text-sm py-6">{tr("עוד אין פגישות. התחל בלשונית פגישה — צלם כרטיס ביקור.")}</div>}
      <ul className="space-y-2">{shown.map((m) => { const ph = waNumber(m.phone, state.profile.phone); return (
        <li key={m.id} className="bg-white border rounded-2xl p-3">
          <button className="w-full text-start" onClick={() => setOpen(open === m.id ? "" : m.id)}><div className="flex justify-between gap-2"><b dir="auto">{m.company}</b><span className="text-xs text-slate-400">{fmtDate(m.at)}</span></div><div className="text-xs text-slate-500" dir="auto">{[m.contact_name, m.contact_role, m.industry && tr(m.industry)].filter(Boolean).join(" · ")}{!m.summary && m.note && " · ✨?"}</div></button>
          {open === m.id && (
            <div className="mt-2 space-y-2 text-sm border-t pt-2">
              <div className="whitespace-pre-wrap" dir="auto">{m.summary || m.note || "—"}</div>
              {m.products.length > 0 && <div className="text-xs text-slate-500" dir="ltr">🧪 {m.products.join(", ")}</div>}
              {m.next_step && <div className={"text-xs " + (m.done ? "line-through text-slate-400" : "")} dir="auto">→ {m.next_step} · {fmtDate(m.due)}</div>}
              <div className="text-xs text-slate-500" dir="ltr">{[m.phone, m.email, m.website].filter(Boolean).join(" · ")}</div>
              <div className="flex flex-wrap gap-2" dir="ltr">
                {m.phone && <a className={btn} href={"tel:" + m.phone.replace(/\s/g, "")}>📞</a>}
                {ph && <a className={btn + " bg-green-600 text-white border-green-600"} href={"https://wa.me/" + ph + "?text=" + encodeURIComponent(m.followup || "")} target="_blank" rel="noreferrer">💬 WhatsApp</a>}
                {m.email && <a className={btn} href={"mailto:" + m.email + "?subject=" + encodeURIComponent("Silitex — " + m.company) + "&body=" + encodeURIComponent(m.followup || "")}>✉️</a>}
                {!m.summary && m.note && <button className={btn + " bg-ink-900 text-white"} disabled={busy === m.id} onClick={() => later(m)}>{busy === m.id ? tr("מסכם…") : "✨ " + tr("סכם + צעד הבא")}</button>}
                {m.done && <button className={btn} onClick={() => patchMeeting(m.id, { done: false })}>↺</button>}
                <button className={btn + (arm === m.id ? " bg-red-600 text-white border-red-600" : " text-red-600")} onClick={() => { if (arm === m.id) { removeMeeting(m.id); setArm(""); } else setArm(m.id); }}>{arm === m.id ? tr("למחוק? לחץ שוב") : "🗑"}</button>
              </div>
            </div>
          )}
        </li>); })}</ul>
      {ms.length > 0 && (
        <div className="bg-white border rounded-2xl p-3 space-y-2">
          <div className="font-bold">📤 {tr("ייצוא — כל הפגישות")}</div>
          <button className="w-full py-3 rounded-xl bg-brand-500 text-white" onClick={() => download("Silitex_meetings_" + stamp + ".csv", meetingsCsv(ms, tr), "text/csv;charset=utf-8")}>⬇️ Excel (CSV)</button>
          <ExportBar title={"Silitex — " + tr("פגישות") + " " + fmtDate(today)} text={meetingsText(ms)} filename={"Silitex_meetings_" + stamp + ".txt"} />
        </div>
      )}
    </div>
  );
}
