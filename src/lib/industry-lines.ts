// industry-lines.ts (src/lib/industry-lines.ts) · updated 18.10.2026 07:45 (Asia/Jerusalem) — per-industry Silitex line for field mode: catalogue rows to propose, competitor codes to try, example questions. Built from catalog_2026 + offsets (no AI cost).
import offsets from "@/data/offsets.json";
import { CAT26, type CatRow } from "@/lib/catalog";
import { INDUSTRIES } from "@/config/industries";
type OffRow = { family: string; dow_corning?: string; inci?: string; silitex_product: string };
const ROWS = (offsets as { rows: OffRow[] }).rows;
const txt = (r: CatRow) => [r.product, r.section, r.description, r.application, r.inci].join(" ");
/** which catalogue rows belong to an industry (sector / section / text) */
const PICK: Record<string, (r: CatRow) => boolean> = {
  water: (r) => r.sector === "Water Treatment",
  agro: (r) => /agri|fertil|pesticid|crop|spray/i.test(txt(r)) && !/food contact/i.test(r.section),
  textile: (r) => r.sector === "Detergency" && /soften|anti stain|fabric|textile/i.test(r.section + " " + r.description),
  paper: (r) => /paper|pulp|cardboard|tissue/i.test(txt(r)) || /^CPL 2(7|9)/i.test(r.product),
  paint: (r) => r.sector === "Paint & Coating" && !/car care|hydrorepell/i.test(r.section),
  clean: (r) => r.sector === "Detergency" && /antifoam|raw materials|eco label|slurry|wax/i.test(r.section),
  build: (r) => /hydrorepell/i.test(r.section) || (r.sector === "Paint & Coating" && /masonry|concrete|mortar|facade/i.test(txt(r))),
  plastic: (r) => /mou?ld|release|rubber|plastic|sliding/i.test(txt(r)) && !/food/i.test(r.section),
  auto: (r) => /car care|polish|tyre|tire/i.test(r.section + " " + r.description),
  cosm: (r) => r.sector === "Cosmetics",
  metal: (r) => r.sector !== "Cosmetics" && /metal|cutting|lubric|drill|mining|high temperature/i.test(txt(r)),
};
export const QUESTIONS: Record<string, string[]> = {
  water: ["נוגד קצף לאגן אוורור בשפכים תעשייתיים", "נוגד קצף ללא סיליקון למתקן ביוגז"],
  agro: ["נוגד קצף לייצור דשנים נוזליים", "תוסף הרטבה למיכל ריסוס"],
  textile: ["מרכך סיליקון ללא D4/D5 לייצוא לאירופה", "מרכך אמינו למגע רך במגבות"],
  paper: ["נוגד קצף FDA לעיסת נייר", "נוגד קצף ל-MBR במפעל נייר"],
  paint: ["נוגד קצף לצבע מים מבריק בלי קרטרים", "תוסף הרטבה ופילוס לצבע מים"],
  clean: ["נוגד קצף לקו מילוי דטרגנט נוזלי", "נוגד קצף לאקו-לייבל"],
  build: ["דוחה מים לטיח ובטון", "דוחה מים באבקה לטיח יבש"],
  plastic: ["חומר שחרור לתבניות גומי", "סיליקון להחלקה בייצור פלסטיק"],
  auto: ["אמולסיה למבריק צמיגים", "שעווה לשטיפת רכב"],
  cosm: ["תחליף D5 לקרם leave-on", "ג'ל אלסטומר כמו DC 9040 בלי D5"],
  metal: ["שמן סיליקון לטמפרטורה גבוהה", "נוגד קצף לנוזל חיתוך"],
};
const firstSku = (s?: string) => (s || "").split(/\s*[\/;,·]\s*/)[0].replace(/^(Dow Corning®|DOWSIL™|XIAMETER®)\s*/i, "").trim();
export function industryLine(key: string): { rows: CatRow[]; codes: string[]; questions: string[] } {
  const ind = INDUSTRIES.find((i) => i.key === key); const pick = PICK[key];
  if (!ind || !pick) return { rows: [], codes: [], questions: [] };
  const seen = new Set<string>(); const rows: CatRow[] = [];
  for (const r of CAT26) { const k = r.product.toUpperCase(); if (r.sector === "Food & Agri" && key !== "agro" && !(key === "paper" && /^CPL 2(7|9)/i.test(r.product))) continue; /* food sector on hold */ if (!seen.has(k) && pick(r)) { seen.add(k); rows.push(r); } }
  const codes = Array.from(new Set(ROWS.filter((r) => ind.match.test([r.family, r.silitex_product, r.inci].join(" "))).map((r) => firstSku(r.dow_corning)).filter((s) => s.length >= 3 && s.length <= 24 && !/^n\/?a\b/i.test(s)))).slice(0, 7);
  return { rows: rows.slice(0, 14), codes, questions: QUESTIONS[key] || [] };
}
