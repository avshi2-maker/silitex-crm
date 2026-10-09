// stages.ts (src/config/stages.ts) · updated 09.10.2026 09:40 (Asia/Jerusalem)
// Sales pipeline stages, in order. Add a stage here → kanban, dashboard, lead page all follow.
import type { Stage } from "@/lib/types";
export const STAGES: { key: Stage; he: string; closed?: boolean }[] = [
  { key: "prospect", he: "פרוספקט" },
  { key: "contacted", he: "נוצר קשר" },
  { key: "sample", he: "דגימה נשלחה" },
  { key: "quote", he: "הצעת מחיר" },
  { key: "negotiation", he: "משא ומתן" },
  { key: "won", he: "נסגר ✓", closed: true },
  { key: "lost", he: "אבוד", closed: true },
];
export const stageHe = (key: string) => STAGES.find((s) => s.key === key)?.he || key;
export const isClosed = (key: string) => !!STAGES.find((s) => s.key === key)?.closed;
