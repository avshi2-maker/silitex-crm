// cadence.ts (src/config/cadence.ts) · updated 09.10.2026 09:40 (Asia/Jerusalem)
// Daily task title per stage + weekly review. Change wording/frequency here only.
import type { Stage } from "@/lib/types";
export const DAILY_BY_STAGE: Record<Stage, string> = {
  prospect: "פנייה ראשונה — {role} ({dept})",
  contacted: "מעקב אחרי פנייה — להציע דגימה",
  sample: "לבדוק תוצאות דגימה אצל הלקוח",
  quote: "מעקב הצעת מחיר",
  negotiation: "סגירת תנאים — כמות, מחיר, אספקה",
  won: "", lost: "",
};
export const WEEKLY_TITLE = "סקירה שבועית: סטטוס, דגימות, הצעת מחיר";
export const WEEKLY_EVERY_DAYS = 7;
