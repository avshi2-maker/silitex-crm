"use client";
// LangSwitch.tsx (src/components/LangSwitch.tsx) · updated 09.10.2026 10:30 (Asia/Jerusalem)
import { useLang } from "@/i18n";
export default function LangSwitch() {
  const { lang, setLang } = useLang();
  const b = (l: "he" | "en" | "it", label: string) => (<button onClick={() => setLang(l)} className={"px-2 py-0.5 text-xs rounded " + (lang === l ? "bg-brand-500 text-white" : "text-slate-300 hover:text-white")}>{label}</button>);
  return <div className="inline-flex gap-1 bg-ink-700 rounded p-0.5">{b("he", "עב")}{b("en", "EN")}{b("it", "IT")}</div>;
}
