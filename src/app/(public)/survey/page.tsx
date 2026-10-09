"use client";
// page.tsx (src/app/(public)/survey/page.tsx) · updated 09.10.2026 13:20 (Asia/Jerusalem) — customer satisfaction assessment (public) → /api/forms kind=survey
import { useState } from "react";
import PublicShell from "@/components/PublicShell";
import { Text, Area, Rating } from "@/components/FormField";
import { Card, btnPrimary } from "@/components/ui";
import { SURVEY_CRITERIA } from "@/config/survey";
import { useLang } from "@/i18n";
export default function SurveyPage() {
  const { t: tr, lang } = useLang();
  const [f, setF] = useState({ company: "", name: "", email: "", product: "" }); const [r, setR] = useState<Record<string, number>>({}); const [nps, setNps] = useState(8); const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setState("busy");
    const res = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "survey", ...f, message: msg, lang, fields: { ...r, nps } }) });
    const j = await res.json(); setState(res.ok && j.ok ? "ok" : "err");
  };
  if (state === "ok") return <PublicShell title={tr("תודה על המשוב!")}><Card>{tr("המשוב נקלט ויעזור לנו לשפר את השירות.")}</Card></PublicShell>;
  return (
    <PublicShell title={tr("סקר שביעות רצון — Silitex ישראל")} sub={tr("2 דקות · 1 = נמוך, 5 = מצוין")}>
      <form onSubmit={submit} className="space-y-4">
        <Card className="grid md:grid-cols-2 gap-3"><Text label={tr("חברה")} value={f.company} onChange={(v) => setF({ ...f, company: v })} required /><Text label={tr("שם")} value={f.name} onChange={(v) => setF({ ...f, name: v })} /><Text label={tr("אימייל")} value={f.email} onChange={(v) => setF({ ...f, email: v })} type="email" required /><Text label={tr("מוצר/ים בשימוש")} value={f.product} onChange={(v) => setF({ ...f, product: v })} /></Card>
        <Card>{SURVEY_CRITERIA.map((c) => <Rating key={c.key} label={tr(c.he)} value={r[c.key] || 0} onChange={(v) => setR({ ...r, [c.key]: v })} />)}</Card>
        <Card><div className="text-sm mb-2">{tr("עד כמה תמליץ על Silitex ישראל לעמית? (0–10)")}</div><input type="range" min="0" max="10" value={nps} onChange={(e) => setNps(Number(e.target.value))} className="w-full accent-brand-500" /><div className="text-center text-2xl font-bold text-brand-500">{nps}</div></Card>
        <Card><Area label={tr("מה נוכל לשפר? (חופשי)")} value={msg} onChange={setMsg} rows={3} /></Card>
        <div className="flex justify-end"><button className={btnPrimary} disabled={state === "busy"}>{state === "busy" ? tr("שולח…") : tr("שלח משוב")}</button></div>
        {state === "err" && <div className="text-sm text-red-600">{tr("שליחה נכשלה — נסה שוב או שלח ב-WhatsApp 050-5231042")}</div>}
      </form>
    </PublicShell>
  );
}
