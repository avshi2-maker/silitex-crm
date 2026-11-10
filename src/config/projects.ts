// projects.ts (src/config/projects.ts) · created 10.11.2026 12:25 (Asia/Jerusalem) — v1.9.8 📁 Projects
// One project per RFQ. Ref #SPR-0001 (Sapirim running number) · open date · version. Edit stages / RFQ words / follow-up here only.
export const PROJECT_PREFIX = "SPR";
/** A → Z, in order. "closed" / "lost" end the project (a new RFQ from the same customer then opens a new number). */
export const PROJECT_STAGES: { id: string; he: string; icon: string; hint: string }[] = [
  { id: "rfq", he: "פנייה התקבלה", icon: "📥", hint: "בקשה לנתונים טכניים / דוגמה / מחיר" },
  { id: "silitex", he: "בקשה לסיליטקס", icon: "🇮🇹", hint: "ממתין לתשובת Silitex" },
  { id: "offer", he: "TDS + הצעת מחיר", icon: "📄", hint: "נתונים והצעה נשלחו ללקוח" },
  { id: "po_sample", he: "PO דוגמה", icon: "🧾", hint: "הזמנת דוגמה מהלקוח" },
  { id: "sample", he: "דוגמה נשלחה", icon: "🧪", hint: "בבדיקה אצל הלקוח" },
  { id: "po", he: "PO מוצר", icon: "📦", hint: "הזמנת מוצר מהלקוח" },
  { id: "invoice", he: "חשבונית ספירים", icon: "🧮", hint: "חשבונית מקומית הופקה" },
  { id: "closed", he: "סגור", icon: "✅", hint: "הסתיים" },
];
export const LOST = { id: "lost", he: "לא התקדם", icon: "⛔", hint: "נסגר בלי הזמנה" };
export const ENDED = ["closed", "lost"];
export const stageOf = (id: string) => PROJECT_STAGES.find((s) => s.id === id) || (id === LOST.id ? LOST : PROJECT_STAGES[0]);
export const stageIdx = (id: string) => Math.max(0, PROJECT_STAGES.findIndex((s) => s.id === id));
/** customer words that mean an RFQ (technical data / sample / price) — checked on INBOUND customer messages only */
export const RFQ_RE = /(sample|quotation|quote|price|pricing|\bTDS\b|data ?sheet|\bSDS\b|MSDS|\bCoA\b|\bMOQ\b|\bRFQ\b|דוגמ|הצעת מחיר|מחיר|מפרט|דף נתונים|דפי נתונים|להשיג|מחפש|כמות)/i;
/** follow-up task opened with every new project (days) */
export const PROJECT_FOLLOWUP_DAYS = 3;
/** filter chips on /projects */
export const PROJECT_FILTERS: { id: string; he: string; stages: string[] }[] = [
  { id: "open", he: "פתוחים", stages: ["rfq", "silitex", "offer", "po_sample", "sample", "po", "invoice"] },
  { id: "wait", he: "ממתין לסיליטקס", stages: ["silitex"] },
  { id: "sample", he: "דוגמה / PO דוגמה", stages: ["po_sample", "sample"] },
  { id: "po", he: "PO מוצר", stages: ["po"] },
  { id: "invoice", he: "חשבונית", stages: ["invoice"] },
  { id: "ended", he: "סגורים", stages: ["closed", "lost"] },
];
