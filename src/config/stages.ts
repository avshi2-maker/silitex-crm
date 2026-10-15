// stages.ts (src/config/stages.ts) · updated 15.10.2026 14:45 (Asia/Jerusalem) — + R&D gate stages: pilot (plant trial) and rd_approved (technical sign-off before purchasing); gate = exit criterion shown on the kanban
// Sales pipeline stages, in order. Add a stage here → kanban, dashboard, lead page all follow.
import type { Stage } from "@/lib/types";
export const STAGES: { key: Stage; he: string; closed?: boolean; gate?: string }[] = [
  { key: "prospect", he: "פרוספקט" },
  { key: "contacted", he: "נוצר קשר" },
  { key: "sample", he: "דגימה נשלחה", gate: "יוצא כשיש: תוצאות מעבדה חיוביות" },
  { key: "pilot", he: "פיילוט במפעל", gate: "יוצא כשיש: פיילוט מאושר בקו" },
  { key: "rd_approved", he: "אישור מו\"פ ✓", gate: "יוצא כשיש: פנייה לרכש" },
  { key: "rfq", he: "RFQ התקבל" },
  { key: "quote", he: "הצעת מחיר" },
  { key: "negotiation", he: "משא ומתן" },
  { key: "won", he: "נסגר ✓", closed: true },
  { key: "lost", he: "אבוד", closed: true },
];
export const stageHe = (key: string) => STAGES.find((s) => s.key === key)?.he || key;
export const isClosed = (key: string) => !!STAGES.find((s) => s.key === key)?.closed;
