// channels.ts (src/config/channels.ts) · updated 25.10.2026 05:30 (Asia/Jerusalem) — honest default angle (no "local stock") · 09.10.2026 09:40
// Promotion channels for /campaign. 'rules' is injected into the prompt.
export const CHANNELS = [
  { key: "email", he: "מייל", rules: "שורת נושא + גוף עד 200 מילים." },
  { key: "whatsapp", he: "WhatsApp", rules: "עד 90 מילים, אמוג'י מינימלי." },
  { key: "linkedin", he: "פוסט LinkedIn", rules: "עד 150 מילים, 3 האשטגים." },
  { key: "onepager", he: "דף מוצר A4", rules: "מבנה דף A4: כותרת, 3 יתרונות, טבלת מוצר→מקבילה, אישורים, CTA." },
];
export const channelHe = (key: string) => CHANNELS.find((c) => c.key === key)?.he || key;
export const DEFAULT_ANGLE = "חלופה איטלקית מקבילה ל-Dow/Wacker · אספקה ישירה מהמפעל לפי הזמנה · דוגמה לבדיקה במעבדה";
