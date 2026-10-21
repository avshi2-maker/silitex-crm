// codes.ts (src/portal/codes.ts) · created 21.10.2026 10:40 (Asia/Jerusalem) — PUBLIC PORTAL: one page per competitor product code (Dow / DOWSIL / XIAMETER, Wacker, Momentive, Shin-Etsu, Evonik, Elkem) → Silitex family equivalent. People search exactly "<code> alternative" — each code gets its own landing page.
import { P_FAMILIES, slugify, portalPaths, type PFamily } from "./data";
export type PCode = { code: string; slug: string; producer: string; family: PFamily };
const TOP = ["Dow", "Shin-Etsu", "Momentive", "Wacker", "Evonik", "Bluestar"];
const SKIP = /series|range|grades|various|equivalent/i;
const seen = new Set<string>();
export const P_CODES: PCode[] = P_FAMILIES.flatMap((f) => f.codes.filter((c) => TOP.some((t) => c.producer.startsWith(t))).flatMap((c) =>
  c.code.split(/\s+\/\s+|;\s*|,\s*/).map((tok) => tok.replace(/[®™]/g, "").trim()).filter((t) => t.length >= 4 && !SKIP.test(t))
    .map((code) => ({ code, slug: slugify(code), producer: c.producer.replace(/\s*\(.*\)$/, ""), family: f }))))
  .filter((c) => { if (!c.slug || seen.has(c.slug)) return false; seen.add(c.slug); return true; });
export const codeBySlug = (s: string) => P_CODES.find((c) => c.slug === s);
export const PRODUCERS = Array.from(new Set(P_CODES.map((c) => c.producer)));
export const CT: Record<string, Record<"he" | "en" | "ru" | "it", string>> = {
  h1: { he: "חלופה ל-", en: "Alternative to ", ru: "Аналог ", it: "Alternativa a " },
  title: { he: "חלופות לקודי מוצר של מתחרים", en: "Alternatives to competitor product codes", ru: "Аналоги кодов продуктов конкурентов", it: "Alternative ai codici prodotto dei concorrenti" },
  intro: { he: "מחפשים תחליף למוצר סיליקון ספציפי? מצאו את הקוד שלכם ותראו את המקבילה מקטלוג Silitex — לבדיקה במעבדה שלכם, עם דוגמה.", en: "Looking for a substitute for a specific silicone product? Find your code and see the Silitex equivalent — to verify in your lab, with a sample.", ru: "Ищете замену конкретному силиконовому продукту? Найдите свой код и посмотрите аналог из каталога Silitex — для проверки в вашей лаборатории, с образцом.", it: "Cercate un sostituto per un prodotto siliconico specifico? Trovate il vostro codice e il corrispondente Silitex — da verificare nel vostro laboratorio, con un campione." },
  by: { he: "יצרן", en: "Producer", ru: "Производитель", it: "Produttore" },
  family: { he: "משפחת מוצרים", en: "Product family", ru: "Семейство продуктов", it: "Famiglia di prodotti" },
  eq: { he: "המקבילה מבית Silitex", en: "Silitex equivalent", ru: "Аналог Silitex", it: "Corrispondente Silitex" },
  note: { he: "מקבילה לבדיקה במעבדה שלכם — לא \"זהה\" ולא \"החלפה ישירה\". נשלח דוגמה ודף נתונים טכני לבדיקה.", en: "An equivalent to verify in your lab — not \"identical\" and not a \"drop-in\". We send a sample and the technical data sheet for testing.", ru: "Аналог для проверки в вашей лаборатории — не «идентичный» и не «прямая замена». Отправим образец и техническое описание.", it: "Un corrispondente da verificare nel vostro laboratorio — non \"identico\" né \"sostituzione diretta\". Inviamo campione e scheda tecnica." },
  same: { he: "קודים נוספים באותה משפחה", en: "Other codes in the same family", ru: "Другие коды этого семейства", it: "Altri codici della stessa famiglia" },
  full: { he: "לטבלת ההשוואה המלאה של המשפחה", en: "Full comparison table for this family", ru: "Полная таблица аналогов семейства", it: "Tabella completa della famiglia" },
  all: { he: "כל הקודים", en: "All codes", ru: "Все коды", it: "Tutti i codici" },
  sample: { he: "בקשו דוגמה בוואטסאפ", en: "Request a sample on WhatsApp", ru: "Запросить образец в WhatsApp", it: "Richiedete un campione su WhatsApp" },
};
/** every portal path incl. the code pages + articles (sitemap, IndexNow) */
export const ARTICLE_PATHS = ["/articles/d4-d5-d6-2027"];
export function allPortalPaths(): string[] { return [...portalPaths(), "/codes", ...ARTICLE_PATHS, ...P_CODES.map((c) => "/codes/" + c.slug)]; }
