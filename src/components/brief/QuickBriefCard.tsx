"use client";
// QuickBriefCard.tsx (src/components/brief/QuickBriefCard.tsx) · created 23.10.2026 08:30 (Asia/Jerusalem) — one-screen customer brief to start a call / meeting: who they are (scan summary), contact (tap to call / WhatsApp / mail), WHAT TO OFFER (top Silitex matches from the website scan), last activity + open tasks, ✨ AI conversation opener (3 openers + 3 questions + 1 offer, Hebrew — meter + export bar via AiPanel) and 📝 log the call to the customer's history.
import { useState } from "react";
import Link from "next/link";
import type { Lead } from "@/lib/types";
import type { useStore } from "@/lib/store";
import { useLang } from "@/i18n";
import { Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import { scanOf } from "@/lib/scan";
import { scoreLead } from "@/lib/priority";
import { fmtDate } from "@/lib/format";

type Store = ReturnType<typeof useStore>;
const wa = (p?: string) => { const d = String(p || "").replace(/\D/g, "").replace(/^0/, "972"); return d.length >= 9 ? "https://wa.me/" + d : ""; };

export default function QuickBriefCard({ lead, store, onBack, onClose }: { lead: Lead; store: Store; onBack: () => void; onClose: () => void }) {
  const { t: tr } = useLang(); const { state, addActivity, addSpend } = store;
  const [note, setNote] = useState(""); const [logged, setLogged] = useState(false);
  const scan = scanOf(lead); const ms = (scan?.data.matches || []).filter((m) => m.confidence !== "low").sort((a, b) => (a.confidence === "high" ? 0 : 1) - (b.confidence === "high" ? 0 : 1)).slice(0, 6);
  const s = scoreLead(lead, state.tasks);
  const acts = state.activities.filter((a) => a.lead_id === lead.id).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 3);
  const tasks = state.tasks.filter((t) => t.lead_id === lead.id && !t.done).slice(0, 3);
  const mails = String(lead.contact_email || "").split(/[,;\s]+/).filter((m) => m.includes("@"));
  const facts = [
    "Customer: " + lead.name + " · industry: " + lead.industry + (lead.sub_industry ? " · " + lead.sub_industry : "") + " · tier: " + lead.tier + " · stage: " + lead.stage,
    scan?.data.summary ? "What they do (from their website): " + scan.data.summary : "",
    (scan?.data.product_lines || []).length ? "Product lines: " + (scan?.data.product_lines || []).map((p) => p.name + (p.examples?.length ? " (" + p.examples.slice(0, 5).join(", ") + ")" : "")).join("; ") : "",
    ms.length ? "Silitex matches (from the website scan): " + ms.map((m) => m.silitex + " — for " + (m.for || "") + " [" + m.confidence + "]").join("; ") : "Use case noted: " + (lead.use_case || lead.product_match || "-"),
    "Contact: " + (lead.contact_name || "-") + (lead.contact_role ? " (" + lead.contact_role + ")" : ""),
    acts.length ? "Last activity: " + acts.map((a) => fmtDate(a.at) + " " + a.text).join(" | ") : "No activity yet",
    tasks.length ? "Open tasks: " + tasks.map((t) => t.title).join(" | ") : "",
  ].filter(Boolean).join("\n");
  const build = () => ({ prompt: "אני אבשי ספיר, מפיץ Silitex (סיליקונים מאיטליה) בישראל. עוד רגע אני מדבר עם הלקוח הזה בטלפון / בפגישה. כתוב בעברית, קצר ותכליתי:\n1. שלושה משפטי פתיחה טבעיים לשיחה (לא מכירתיים מדי).\n2. שלוש שאלות בירור שיגלו איפה הם משתמשים היום בסיליקון / נוגדי קצף / חומרי הרטבה ומי הספק.\n3. הצעה אחת קונקרטית של דרגת Silitex לבדיקה (רק מתוך ההתאמות שלמטה) + הצעד הבא (דוגמה / TDS / ניסוי מעבדה).\nאל תמציא עובדות שלא מופיעות בנתונים.", context: facts });
  const log = () => { if (!note.trim()) return; addActivity(lead.id, "call", "📞 " + note.trim()); setNote(""); setLogged(true); setTimeout(() => setLogged(false), 2500); };
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-start gap-2">
        <button className={btnGhost} onClick={onBack}>→ {tr("חזרה לחיפוש")}</button>
        <div className="flex-1 min-w-[12rem]"><div className="font-bold text-base" dir="auto">{lead.name}</div><div className="text-xs text-slate-500" dir="auto">{lead.industry}{lead.city ? " · " + lead.city : ""} · {lead.tier}</div></div>
        <Badge tone={s.grade === "A" ? "green" : s.grade === "B" ? "blue" : "slate"}>{s.grade} · {s.total}</Badge>
        <Link className={btnGhost} href={"/leads/" + lead.id} onClick={onClose}>{tr("פתח כרטיס")} ↗</Link>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div className="border rounded-lg p-2 space-y-1">
          <div className="text-xs text-slate-500">{tr("איש קשר")}</div>
          <div dir="auto">{lead.contact_name || "—"}{lead.contact_role ? " · " + lead.contact_role : ""}</div>
          <div className="flex flex-wrap gap-2">{lead.contact_phone && <a className="text-brand-600 underline" href={"tel:" + lead.contact_phone}>📱 {lead.contact_phone}</a>}{wa(lead.contact_phone) && <a className="text-emerald-700 underline" href={wa(lead.contact_phone)} target="_blank" rel="noreferrer">WhatsApp</a>}{mails.slice(0, 2).map((m) => <a key={m} className="text-brand-600 underline" href={"mailto:" + m}>{m}</a>)}{lead.website && <a className="text-slate-600 underline" href={lead.website} target="_blank" rel="noreferrer">{tr("אתר")}</a>}</div>
        </div>
        <div className="border rounded-lg p-2"><div className="text-xs text-slate-500">{tr("מה הם עושים")}</div><div className="text-[13px] leading-5" dir="auto">{scan?.data.summary || lead.sub_industry || lead.use_case || "—"}</div></div>
      </div>
      <div className="border rounded-lg p-2 space-y-1">
        <div className="text-xs text-slate-500">{tr("מה להציע — התאמות Silitex מסריקת האתר")}</div>
        {ms.length ? ms.map((m, i) => <div key={i} className="flex gap-2 items-start"><Badge tone={m.confidence === "high" ? "green" : "amber"}>{m.confidence === "high" ? tr("חזק") : tr("בינוני")}</Badge><span className="font-medium" dir="ltr">{m.silitex}</span><span className="text-slate-500 text-xs" dir="auto">{m.for}</span></div>) : <div className="text-slate-500">{lead.product_match || lead.use_case || tr("אין עדיין סריקה — פתח כרטיס וסרוק את האתר")}</div>}
      </div>
      {(acts.length > 0 || tasks.length > 0) && <div className="border rounded-lg p-2 space-y-1 text-xs">{acts.map((a) => <div key={a.id} dir="auto">🕘 {fmtDate(a.at)} · {a.text}</div>)}{tasks.map((t) => <div key={t.id} dir="auto" className="text-amber-700">☐ {t.due ? fmtDate(t.due) + " · " : ""}{t.title}</div>)}</div>}
      <div className="border rounded-lg p-2"><AiPanel title={tr("✨ פתיחת שיחה — ") + lead.name} buttonLabel={tr("משפטי פתיחה ושאלות")} buildPrompt={build} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} onResult={() => addActivity(lead.id, "ai", tr("נוצר תדריך שיחה AI"))} /></div>
      <div className="flex gap-2 items-center"><input className={inputCls} placeholder={tr("📝 תיעוד שיחה — שורה אחת (נשמר בהיסטוריה של הלקוח)")} value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") log(); }} dir="auto" /><button className={btnPrimary} disabled={!note.trim()} onClick={log}>{logged ? "✓" : tr("שמור")}</button></div>
    </div>
  );
}
