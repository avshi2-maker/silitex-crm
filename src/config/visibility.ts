// visibility.ts (src/config/visibility.ts) · updated 18.10.2026 18:50 (Asia/Jerusalem) — AI VISIBILITY BOT settings: the questions a real buyer / technician would ask an AI chat, and what counts as "us". Add or edit a line here to change what is checked every month.
export type VisQ = { id: string; lang: "he" | "en" | "ru"; q: string };
export const VIS_QUESTIONS: VisQ[] = [
  { id: "he-antifoam-buy", lang: "he", q: "איפה קונים נוגד קצף סיליקוני לתעשייה בישראל?" },
  { id: "he-dowsil1520", lang: "he", q: "מה החלופה ל-DOWSIL 1520 ומי מספק אותה בישראל?" },
  { id: "he-textile-softener", lang: "he", q: "ספק מרככי סיליקון לטקסטיל בישראל" },
  { id: "he-stone-repellent", lang: "he", q: "איזה דוחה מים סיליקוני מומלץ לבטון ולאבן, ומי מוכר אותו בישראל?" },
  { id: "he-d5", lang: "he", q: "האם D5 אסור בקוסמטיקה, ומה החלופות?" },
  { id: "he-distributor", lang: "he", q: "מי מפיץ סיליקונים ואמולסיות סיליקון לתעשייה בישראל?" },
  { id: "en-silitex-israel", lang: "en", q: "Who distributes Silitex silicone products in Israel?" },
  { id: "en-antifoam-a", lang: "en", q: "Alternative to Dow Corning Antifoam A — supplier in Israel" },
  { id: "en-wastewater", lang: "en", q: "Silicone antifoam for industrial wastewater treatment — supplier in Israel" },
  { id: "en-italian-emulsions", lang: "en", q: "Italian manufacturer of silicone emulsions, antifoams and textile softeners" },
  { id: "ru-antifoam", lang: "ru", q: "Где купить силиконовый пеногаситель для производства в Израиле?" },
  { id: "ru-dowsil1520", lang: "ru", q: "Аналог DOWSIL 1520 — кто поставляет в Израиле?" },
];
export const VIS_WATCH = {
  sapirimDomain: /sapirim\.com/i, sapirimText: /sapirim|ספירים|сапирим/i,
  silitexText: /silitex/i,
  brands: { Dow: /\bdow\b|dowsil|xiameter|dow corning/i, Wacker: /wacker|belsil|silfoam/i, Momentive: /momentive/i, "Shin-Etsu": /shin-?etsu/i, Evonik: /evonik|tego/i, Elkem: /elkem|bluestar|mirasil/i, Silitex: /silitex/i } as Record<string, RegExp>,
};
