"use client";
// page.tsx (src/app/field/page.tsx) · updated 18.10.2026 10:55 (Asia/Jerusalem) — + language switch HE/EN/IT/RU under the header · 10:30 — ← CRM opens the full CRM address (field runs on silitex-field.*) · + 📤 capture tab (phone → Cloudinary, processed at the office in /capture) · OWNER ONLY. Mobile "field mode" for customer visits & shows: 🔎 walking encyclopedia (industry filter, food excluded) · 🤝 paperless meeting (card scan, dictation, AI summary → lead + log + task) · 🪪 my e-card (QR) · today's list. Works offline; syncs when signal returns.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore, pendingSync, flushQueue } from "@/lib/store";
import AskTab from "@/components/field/AskTab";
import MeetTab from "@/components/field/MeetTab";
import CardTab from "@/components/field/CardTab";
import CaptureTab from "@/components/field/CaptureTab";
import { fmtDate, todayIso } from "@/lib/format";
import { useLang } from "@/i18n";
import { CRM_URL } from "@/config/mobile-apps";
import LangSwitch from "@/components/LangSwitch";
const TABS = [["ask", "🔎", "אנציקלופדיה"], ["cap", "📤", "צילום / הקלטה"], ["meet", "🤝", "פגישה + AI"], ["card", "🪪", "הכרטיס שלי"], ["day", "☀️", "היום"]] as const;
export default function FieldPage() {
  const { t: tr } = useLang();
  const { state, ready } = useStore();
  const [tab, setTab] = useState<string>("ask"); const [industry, setIndustry] = useState(""); const [pending, setPending] = useState(0); const [online, setOnline] = useState(true);
  useEffect(() => {
    try { const s = localStorage.getItem("field-tab"); if (s) setTab(s); const i = localStorage.getItem("field-ind"); if (i) setIndustry(i); } catch {}
    const tick = () => { setPending(pendingSync()); setOnline(navigator.onLine); }; tick(); const t = setInterval(tick, 4000);
    const on = () => { flushQueue().then(setPending); setOnline(true); }; const off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { clearInterval(t); window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  const go = (k: string) => { setTab(k); try { localStorage.setItem("field-tab", k); } catch {} };
  const setInd = (k: string) => { setIndustry(k); try { localStorage.setItem("field-ind", k); } catch {} };
  if (!ready) return null;
  const today = todayIso(); const todays = state.tasks.filter((t) => !t.done && t.due <= today).sort((a, b) => a.due.localeCompare(b.due));
  return (
    <div className="max-w-xl mx-auto -m-6 min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-10 bg-ink-900 text-white px-4 py-3 flex items-center justify-between">
        <a href={CRM_URL} className="text-sm opacity-80">← CRM</a>
        <div className="font-bold">{tr("מצב שטח")} · Silitex</div>
        <div className="text-xs">{online ? <span className="text-green-300">● online</span> : <span className="text-amber-300">● offline</span>}{pending > 0 && <span className="ms-1 text-amber-300">· {pending} {tr("ממתינים")}</span>}</div>
      </header>
      <div className="bg-ink-900 border-t border-white/10 px-4 py-1 flex justify-center"><LangSwitch /></div>
      <main className="p-3 space-y-3">
        {tab === "ask" && <AskTab industry={industry} setIndustry={setInd} />}
        {tab === "cap" && <CaptureTab />}
        {tab === "meet" && <MeetTab industry={industry} />}
        {tab === "card" && <CardTab />}
        {tab === "day" && (
          <div className="bg-white border rounded-2xl p-3 space-y-2">
            <div className="font-bold">{tr("היום")} · {fmtDate(today)} <span className="text-slate-400 font-normal">({todays.length})</span></div>
            {todays.length === 0 && <div className="text-sm text-slate-400">—</div>}
            <ul className="divide-y">{todays.map((t) => { const l = state.leads.find((x) => x.id === t.lead_id); return (
              <li key={t.id} className="py-2 text-sm flex items-center gap-2"><div className="flex-1"><div className="font-medium">{t.title}</div><div className="text-xs text-slate-500">{t.lead_name} · <span className={t.due < today ? "text-red-600" : ""}>{fmtDate(t.due)}</span></div></div>{l?.contact_phone && <a href={"tel:" + l.contact_phone.replace(/\s/g, "")} className="px-3 py-2 rounded-lg border">📞</a>}</li>); })}</ul>
            <Link href="/today" className="block text-center text-sm text-brand-600 underline">{tr("היום שלי — מסך מלא")}</Link>
          </div>
        )}
      </main>
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t grid grid-cols-5 max-w-xl mx-auto">{TABS.map(([k, ic, he]) => <button key={k} onClick={() => go(k)} className={"py-2 flex flex-col items-center text-xs " + (tab === k ? "text-brand-600 font-bold" : "text-slate-500")}><span className="text-2xl">{ic}</span><span className="leading-tight">{tr(he)}</span></button>)}</nav>
    </div>
  );
}
