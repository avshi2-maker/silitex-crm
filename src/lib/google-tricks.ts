// google-tricks.ts (src/lib/google-tricks.ts) · created 21.10.2026 11:05 (Asia/Jerusalem) — Google search-operator recipes (quotes, minus, site:, filetype:, after:, OR, intitle:) turned into one-click links: lead hunting on every lead card + SEO / link-opportunity checks on /promo. No API, no cost — opens Google in a new tab.
import type { Lead } from "./types";
export const g = (q: string) => "https://www.google.com/search?q=" + encodeURIComponent(q);
export type Q = { icon: string; label: string; q: string; tip?: string };
const short = (name: string) => name.replace(/\s*\(.*?\)\s*/g, " ").replace(/\b(ltd|ltd\.|inc|group|industries|israel|co\.?|limited|בע"מ)\b/gi, "").replace(/\s+/g, " ").trim();
const domainOf = (w?: string) => (w || "").toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
const yearAgo = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().slice(0, 10); };
/** roles worth chasing per CRM industry (English + Hebrew titles as people write them on LinkedIn) */
const ROLES: [RegExp, string][] = [
  [/paint|coating|varnish|ink/i, '("R&D" OR "formulation chemist" OR "paint chemist" OR "technical manager" OR "מנהל מעבדה" OR כימאי)'],
  [/cosmetic|personal care/i, '("formulator" OR "cosmetic chemist" OR "R&D" OR "מפתח פורמולציות" OR "מנהלת מעבדה" OR רוקח)'],
  [/textile|fabric/i, '("dyeing" OR "finishing" OR "R&D" OR "process engineer" OR "מנהל צביעה" OR "מנהל טכני")'],
  [/detergent|cleaning|hygiene|tissue/i, '("R&D" OR "formulation" OR "technical manager" OR "מנהל פיתוח" OR "מנהל מעבדה")'],
  [/agri|agrochem/i, '("formulation" OR "R&D" OR "agronomist" OR "regulatory" OR "מנהל פיתוח" OR "כימאי")'],
  [/water|power|cooling/i, '("water treatment" OR "process engineer" OR "plant manager" OR "מהנדס תהליך" OR "מנהל מפעל")'],
  [/paper|packaging/i, '("process engineer" OR "paper machine" OR "production manager" OR "מנהל ייצור" OR "מהנדס תהליך")'],
  [/rubber|plastic|adhesive|label/i, '("compounding" OR "process engineer" OR "R&D" OR "מהנדס תהליך" OR "מנהל טכני")'],
  [/oil|gas|hydrocarbon/i, '("process engineer" OR "chemicals" OR "operations" OR "מהנדס תהליך")'],
];
export const rolesFor = (industry = "") => ROLES.find(([re]) => re.test(industry))?.[1] || '("R&D" OR "technical manager" OR "plant manager" OR procurement OR רכש OR "מנהל טכני")';
/** 1-click searches for one lead (who to call, is the company real, what they make, who supplies them) */
export function leadQueries(l: Lead): Q[] {
  const n = short(l.name); const d = domainOf(l.website); const out: Q[] = [
    { icon: "👤", label: "אנשי מפתח בלינקדאין", q: 'site:linkedin.com/in "' + n + '" ' + rolesFor(l.industry), tip: "R&D / מעבדה / טכני / רכש — לפי התעשייה" },
    { icon: "🏭", label: "כל העובדים בלינקדאין", q: 'site:linkedin.com/in "' + n + '" -jobs' },
    { icon: "✅", label: "אימות — החברה קיימת?", q: '"' + n + '" (site:d.co.il OR site:bdicode.co.il OR site:dunsguide.co.il OR site:chamber.org.il)', tip: "אין תוצאות = כנראה רשימה מומצאת" },
    { icon: "📰", label: "חדשות מהשנה האחרונה", q: '"' + n + '" after:' + yearAgo() + " -jobs", tip: "הרחבה, מפעל חדש, מכרז = טריגר לשיחה" },
    { icon: "🥊", label: "מי הספק שלהם היום", q: '"' + n + '" (Dow OR DOWSIL OR Wacker OR Momentive OR silicone OR סיליקון OR antifoam)' },
  ];
  if (d) out.push(
    { icon: "📄", label: "מסמכים טכניים באתר שלהם", q: "site:" + d + " (filetype:pdf OR MSDS OR SDS OR \"data sheet\" OR \"גיליון בטיחות\")", tip: "ב-SDS כתובים חומרי הגלם — מה הם קונים" },
    { icon: "📞", label: "דף קשר / טלפון באתר", q: "site:" + d + ' (contact OR "צור קשר" OR טלפון OR "R&D")' },
  );
  return out;
}
/** #1 — is Google indexing sapirim.com? */
export const INDEX_QUERIES: Q[] = [
  { icon: "📈", label: "כל העמודים שגוגל מכיר", q: "site:sapirim.com", tip: "המספר צריך לעלות מעשרות למאות בשבועות הקרובים" },
  { icon: "🇮🇱", label: "עמודים בעברית", q: "site:sapirim.com/he" },
  { icon: "🇬🇧", label: "עמודים באנגלית", q: "site:sapirim.com/en" },
  { icon: "🔢", label: "דפי קודי מתחרים", q: "site:sapirim.com/he/codes" },
  { icon: "📰", label: "מאמר D4/D5/D6", q: "site:sapirim.com inurl:articles" },
  { icon: "🔗", label: "מי מזכיר / מקשר אלינו", q: '"sapirim.com" -site:sapirim.com', tip: "כל תוצאה כאן = קישור חיצוני (backlink)" },
  { icon: "🧪", label: "בדיקת מילת מפתח: חלופה ל-DOWSIL", q: '"DOWSIL 1520" חלופה OR alternative', tip: "האם sapirim.com מופיע? המטרה: עמוד 1" },
];
/** #4 — competition + places that can link to us */
export const LINK_QUERIES: Q[] = [
  { icon: "🥊", label: "מפיצי סיליקון בישראל (מתחרים)", q: '("Dow" OR "Wacker" OR "Momentive" OR "Shin-Etsu") (מפיץ OR distributor) ישראל סיליקון' },
  { icon: "📒", label: "רשימות ספקי חומרי גלם (לבקש קישור)", q: '("ספקים" OR "suppliers") ("חומרי גלם" OR "raw materials") (צבעים OR קוסמטיקה OR כימיקלים) site:co.il' },
  { icon: "🏛️", label: "מדריכי תעשייה / אינדקסים", q: '(אינדקס OR מדריך OR directory) "כימיקלים לתעשייה" site:co.il' },
  { icon: "📰", label: "כתבות D5/D6 טריות לשתף (עם הקישור שלנו)", q: '(intitle:D5 OR intitle:cyclopentasiloxane OR intitle:siloxane) 2027 after:' + new Date(Date.now() - 180 * 864e5).toISOString().slice(0, 10) },
  { icon: "📄", label: "דפי נתונים של מתחרים (רעיונות ל-FAQ)", q: '"cyclopentasiloxane" (alternative OR replacement) filetype:pdf' },
  { icon: "🎓", label: "פורומים / קבוצות של כימאים", q: '(פורום OR קבוצה OR כנס) (כימאים OR "פורמולציה" OR "צבעים וציפויים") ישראל after:' + new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10) },
];
/** off-site links that move Google — checklist on /promo */
export const LINK_TASKS: { id: string; label: string; how: string; url?: string }[] = [
  { id: "silitex", label: "Silitex.it — דף מפיץ ישראל עם קישור", how: "לבקש מפדריקה: Sapirim Israel + קישור ל-www.sapirim.com (הקישור החזק ביותר)", url: "https://www.silitex.it" },
  { id: "marble", label: "marble-art.co.il — קישור בפוטר", how: "קישור \"קבוצת ספירים\" לכל עמוד באתר" },
  { id: "artfloor", label: "artfloor.co.il — קישור בפוטר", how: "קישור \"קבוצת ספירים\" בפוטר" },
  { id: "linkedin", label: "LinkedIn — שדה אתר", how: "פרופיל → Contact info → Website: www.sapirim.com", url: "https://www.linkedin.com/in/%D7%90%D7%91%D7%A9%D7%99-%D7%A1%D7%A4%D7%99%D7%A8-338a425" },
  { id: "fb", label: "פייסבוק AI — About + תגובה ראשונה", how: "Page → About → Website; קישור בתגובה ראשונה לכל פוסט", url: "https://www.facebook.com/profile.php?id=61595676957729" },
  { id: "wa", label: "WhatsApp Business — אתר בפרופיל", how: "הגדרות → כלים לעסקים → פרופיל → אתר" },
  { id: "gbp", label: "Google Business Profile", how: "\"Sapirim — סיליקונים לתעשייה\" + אתר + טלפון (מפות וחיפוש מקומי)", url: "https://business.google.com/create" },
  { id: "dco", label: "דפי זהב / d.co.il — רישום עם קישור", how: "רישום עסק חינמי עם אתר", url: "https://www.d.co.il" },
  { id: "stonhard", label: "Stonhard — רשימת מתקינים", how: "לבקש הופעה כמתקין מוסמך בישראל עם קישור" },
  { id: "gsc", label: "Google Search Console — מחובר", how: "✓ בוצע 20/10/2026", url: "https://search.google.com/search-console?resource_id=sc-domain:sapirim.com" },
  { id: "bing", label: "Bing Webmaster — מחובר", how: "✓ בוצע 20/10/2026 (מזין גם את ChatGPT ו-Copilot)", url: "https://www.bing.com/webmasters" },
];
