"use client";
// page.tsx (src/app/expo/page.tsx) · updated 18.10.2026 11:55 (Asia/Jerusalem) — EXPO: guest field mode for Silitex staff (partner name + PIN) at trade shows / plant visits — 🔎 encyclopedia (partner-safe) · 🤝 meeting + AI · 📋 contacts & tasks + Excel export · 🪪 her e-card. Everything is stored ONLY on her phone; nothing from the owner CRM is loaded.
import { useEffect, useState } from "react";
import { useExpo } from "@/lib/expo/store";
import ExpoAsk from "@/components/expo/ExpoAsk";
import ExpoMeet from "@/components/expo/ExpoMeet";
import ExpoList from "@/components/expo/ExpoList";
import ExpoCard from "@/components/expo/ExpoCard";
import LangSwitch from "@/components/LangSwitch";
import { useLang } from "@/i18n";
const TABS = [["ask", "🔎", "אנציקלופדיה"], ["meet", "🤝", "פגישה + AI"], ["list", "📋", "אנשי קשר"], ["card", "🪪", "הכרטיס שלי"]] as const;
export default function ExpoPage() {
  const { t: tr, lang, setLang } = useLang();
  const expo = useExpo();
  const [tab, setTab] = useState("meet"); const [industry, setIndustry] = useState(""); const [online, setOnline] = useState(true);
  useEffect(() => {
    try { if (!localStorage.getItem("silitex-lang") && lang === "he") setLang("en"); const t = localStorage.getItem("expo-tab"); if (t) setTab(t); setIndustry(localStorage.getItem("expo-ind") || ""); } catch {}
    const on = () => setOnline(true), off = () => setOnline(false); setOnline(navigator.onLine);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (expo.ready && (!expo.state.profile.first.trim() || !expo.state.profile.phone.trim()) && !localStorage.getItem("expo-tab")) setTab("card"); }, [expo.ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const go = (k: string) => { setTab(k); try { localStorage.setItem("expo-tab", k); } catch {} };
  const setInd = (k: string) => { setIndustry(k); try { localStorage.setItem("expo-ind", k); } catch {} };
  if (!expo.ready) return null;
  const open = expo.state.meetings.filter((m) => m.next_step && !m.done).length;
  return (
    <div className="max-w-xl mx-auto -m-6 min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-10 bg-ink-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="font-bold">Silitex Expo</div>
        <div className="text-xs opacity-80">{expo.state.profile.first || tr("מצב שטח")}</div>
        <div className="text-xs">{online ? <span className="text-green-300">● online</span> : <span className="text-amber-300">● offline</span>}</div>
      </header>
      <div className="bg-ink-900 border-t border-white/10 px-4 py-1 flex justify-center"><LangSwitch /></div>
      <main className="p-3 space-y-3">
        {tab === "ask" && <ExpoAsk expo={expo} industry={industry} setIndustry={setInd} />}
        {tab === "meet" && <ExpoMeet expo={expo} industry={industry} />}
        {tab === "list" && <ExpoList expo={expo} />}
        {tab === "card" && <ExpoCard expo={expo} />}
        <div className="text-[11px] text-center text-slate-400">{tr("Silitex Expo · הנתונים נשמרים רק בטלפון הזה")}</div>
      </main>
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t grid grid-cols-4 max-w-xl mx-auto">{TABS.map(([k, ic, he]) => (
        <button key={k} onClick={() => go(k)} className={"py-2 flex flex-col items-center text-xs relative " + (tab === k ? "text-brand-600 font-bold" : "text-slate-500")}><span className="text-xl">{ic}</span>{tr(he)}{k === "list" && open > 0 && <span className="absolute top-1 end-1/4 bg-brand-500 text-white rounded-full text-[10px] px-1.5">{open}</span>}</button>
      ))}</nav>
    </div>
  );
}
