// channels.ts (src/config/channels.ts) · updated 09.10.2026 09:40 (Asia/Jerusalem)
// Promotion channels for /campaign. 'rules' is injected into the prompt.
export const CHANNELS = [
  { key: "email", he: "מייל", rules: "שורת נושא + גוף עד 200 מילים." },
  { key: "whatsapp", he: "WhatsApp", rules: "עד 90 מילים, אמוג'י מינימלי." },
  { key: "linkedin", he: "פוסט LinkedIn", rules: "עד 150 מילים, 3 האשטגים." },
  { key: "onepager", he: "דף מוצר A4", rules: "מבנה דף A4: כותרת, 3 יתרונות, טבלת מוצר→מקבילה, אישורים, CTA." },
];
export const channelHe = (key: string) => CHANNELS.find((c) => c.key === key)?.he || key;
export const DEFAULT_ANGLE = "החלפת ספק Dow/Wacker במלאי מקומי + אישורי FDA/כשרות";
