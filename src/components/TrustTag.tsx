// TrustTag.tsx (src/components/TrustTag.tsx) · updated 27.10.2026 07:10 (Asia/Jerusalem) — v1.1.0 CellCodes: per-code ✓ INCI / ⚠ · created 26.10.2026 11:10 (Asia/Jerusalem) — v0.99.0
// 🟨 yellow notice for data we have NOT verified (or don't know) — so every claim on screen is true. Works in client and server components.
import { UNVERIFIED, UNKNOWN, splitCell, checkOf, isVerifiedProducer } from "@/lib/offsets-trust";
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
/** green chip: code confirmed on the producer's own page (INCI + link) */
export function Verified({ inci, src, lang = "he" }: { inci?: string; src?: string; lang?: L }) {
  const c = "inline-block align-middle rounded px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 whitespace-nowrap";
  const label = "✓ " + (lang === "he" ? "מאומת" : lang === "ru" ? "проверено" : lang === "it" ? "verificato" : "verified");
  return src ? <a href={src} target="_blank" rel="noreferrer" className={c} title={inci}>{label}</a> : <span className={c} title={inci}>{label}</span>;
}
/** a producer cell "A / B": each code with its own ✓ INCI or ⚠ */
export function CellCodes({ producer, cell, lang = "he", showInci = true }: { producer: string; cell?: string; lang?: L; showInci?: boolean }) {
  const codes = splitCell(cell); if (!codes.length) return <Unknown lang={lang} />;
  if (isVerifiedProducer(producer)) return <>{cell}</>;
  return <span className="inline-flex flex-col gap-1">{codes.map((code) => { const ck = checkOf(producer, code); return <span key={code}>{code}{" "}{ck?.status === "ok" ? <><Verified inci={ck.inci} src={ck.src} lang={lang} />{ck.cyclic && <span className="ms-1 inline-block rounded px-1 text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200" title="D4/D5/D6 — EU 2024/1328">D5/D6</span>}{showInci && ck.inci && <span className="block text-[10px] text-slate-500" dir="ltr">{ck.inci}</span>}</> : <span title={ck?.note || UNVERIFIED[lang]}><Unverified lang={lang} /></span>}</span>; })}</span>;
}
