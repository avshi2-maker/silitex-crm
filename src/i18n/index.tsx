"use client";
// index.tsx (src/i18n/index.tsx) · updated 10.10.2026 06:55 (Asia/Jerusalem)
// Language switch HE/EN. t(s): Hebrew source string → English from en.ts (falls back to Hebrew). Persisted per browser; sets <html dir/lang>.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { EN } from "./en";
import { IT } from "./it";
export type Lang = "he" | "en" | "it";
const DICT: Record<string, Record<string, string>> = { en: EN, it: IT };
const isLang = (v: unknown): v is Lang => v === "he" || v === "en" || v === "it";
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (s: string) => string };
const C = createContext<Ctx>({ lang: "he", setLang: () => {}, t: (s) => s });
const KEY = "silitex-lang";
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("he");
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("lang");
      if (isLang(q)) { setLangState(q); localStorage.setItem(KEY, q); return; }
      const v = localStorage.getItem(KEY); if (isLang(v)) setLangState(v);
    } catch {}
  }, []);
  useEffect(() => { document.documentElement.dir = lang === "he" ? "rtl" : "ltr"; document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem(KEY, l); } catch {} };
  const t = (s: string) => {
    if (lang === "he") return s; const D = DICT[lang];
    const exact = D[s] ?? EN[s]; if (exact !== undefined) return exact;
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/); const core = m ? m[2] : s;
    return (m ? m[1] : "") + (D[core] ?? EN[core] ?? core) + (m ? m[3] : "");
  };
  return <C.Provider value={{ lang, setLang, t }}>{children}</C.Provider>;
}
export const useLang = () => useContext(C);
