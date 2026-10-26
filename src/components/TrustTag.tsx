// TrustTag.tsx (src/components/TrustTag.tsx) · created 26.10.2026 11:10 (Asia/Jerusalem) — v0.99.0
// 🟨 yellow notice for data we have NOT verified (or don't know) — so every claim on screen is true. Works in client and server components.
import { UNVERIFIED, UNKNOWN } from "@/lib/offsets-trust";
type L = "he" | "en" | "it" | "ru";
const cls = "inline-block align-middle rounded px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap";
/** small chip after an unverified value */
export function Unverified({ lang = "he" }: { lang?: L }) { return <span className={cls} title={UNVERIFIED[lang]}>⚠ {lang === "he" ? "לא מאומת" : lang === "ru" ? "не проверено" : lang === "it" ? "non verificato" : "unverified"}</span>; }
/** chip in place of a value we don't know */
export function Unknown({ lang = "he" }: { lang?: L }) { return <span className={cls}>? {UNKNOWN[lang]}</span>; }
/** full-width yellow banner explaining the rule */
export function TrustBanner({ lang = "he", text }: { lang?: L; text?: string }) {
  return <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-sm px-3 py-2" dir={lang === "he" ? "rtl" : "ltr"}>🟨 {text || UNVERIFIED[lang]}</div>;
}
