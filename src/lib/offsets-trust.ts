// offsets-trust.ts (src/lib/offsets-trust.ts) · created 26.10.2026 11:10 (Asia/Jerusalem) — v0.99.0
// TRUTH RULE (Avshi 26/10/2026: "100% real data — where we don't know, a yellow notice, so our claim is true").
// Verified sources only: Silitex column (silitex.it + 2026 catalogues, 12–13/10/2026) · Silitex OFFICIAL cosmetic countertype leaflet
// (Federica 19/10/2026: Dow / BRB / Momentive / Wacker per cosmetic product) · NuSil column (CareSil documents 2013–2016).
// Everything else in the market table (incl. its Dow column) = UNVERIFIED → always shown with the yellow notice.
import offsets from "@/data/offsets.json";
export const VERIFIED_PRODUCERS: Record<string, string> = ((offsets as { verified_producers?: Record<string, string> }).verified_producers) || {};
export const isVerifiedProducer = (p: string) => !!VERIFIED_PRODUCERS[p] || /^NuSil/i.test(p);
export const isUnknown = (v?: string | null) => !v || !v.trim() || /^n\/?a\b|^—$|^-$/i.test(v.trim());
export const UNVERIFIED: Record<"he" | "en" | "it" | "ru", string> = {
  he: "לא מאומת — מטבלת שוק, טרם נבדק מול דף הנתונים של היצרן",
  en: "Unverified — from a market table, not yet checked against the producer's data sheet",
  it: "Non verificato — da una tabella di mercato, non ancora confrontato con la scheda tecnica del produttore",
  ru: "Не проверено — из рыночной таблицы, ещё не сверено с техническим листом производителя",
};
export const UNKNOWN: Record<"he" | "en" | "it" | "ru", string> = { he: "לא ידוע", en: "Unknown", it: "Non noto", ru: "Неизвестно" };
/** public portal wording (alternatives + competitor-code pages) */
export const PORTAL_NOTE: Record<"he" | "en" | "it" | "ru", string> = {
  he: "קודי המתחרים בעמוד זה לקוחים מטבלת השוואת שוק וטרם אומתו מול דף הנתונים של כל יצרן. ראו בהם נקודת פתיחה לבדיקה במעבדה — לא התאמה מאושרת.",
  en: "Competitor codes on this page come from a market comparison table and have not yet been verified against each producer's data sheet. Treat them as a starting point for a lab test — not a confirmed match.",
  it: "I codici dei concorrenti in questa pagina provengono da una tabella comparativa di mercato e non sono ancora stati verificati con la scheda tecnica di ciascun produttore. Sono un punto di partenza per un test di laboratorio, non una corrispondenza confermata.",
  ru: "Коды конкурентов на этой странице взяты из рыночной сравнительной таблицы и ещё не сверены с техническими листами производителей. Это отправная точка для лабораторного теста, а не подтверждённое соответствие.",
};
