// campaign-templates.ts (src/config/campaign-templates.ts) · created 25.10.2026 05:30 (Asia/Jerusalem)
// APPROVED campaign texts (Avshi, 25.10.2026) — shown ready-to-copy at the top of /campaign. Honest by rule: supply direct from Italy per order
// (no local stock), "מקביל ל-" not "מחליף", certificates per product with the TDS, food grades only for non-food producers that need food approval.
export type CampaignTemplate = { id: string; ind: string; channel: string; title: string; subject: string; body: string };
export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "clean-email-2510", ind: "clean", channel: "email", title: "דטרגנטים וניקוי — מייל (נוסח מאושר 25/10/2026)",
    subject: "חלופה איטלקית לסיליקונים של Dow / Wacker / Momentive — נוגדי קצף ומרככים | Silitex",
    body: `שלום,

אם אתם עובדים היום עם XIAMETER, Dow Corning, Wacker או Momentive — Silitex, יצרן סיליקונים איטלקי, מציע מוצרים מקבילים בתפקוד, עם ליווי טכני בעברית מספירים.

למה לבחון את Silitex?
• מוצרים מקבילים בתפקוד למותגים הגלובליים המובילים
• אספקה ישירה מהמפעל באיטליה לפי הזמנה — חומר טרי, עם חיי מדף מלאים
• תמחור תחרותי וליווי טכני מקומי, מהבדיקה במעבדה ועד האישור בייצור
• תעודות ואישורים (FDA / E900 / כשרות) לפי המוצר — נשלח עם המפרט הטכני

דוגמאות:
• BERETEX 1000 — מקביל ל-XIAMETER AFE-1000 · דטרגנטים נוזליים, מערכות CIP
• BERETEX 1000 AD — מקביל ל-Momentive SAG 1571 · מינון אוטומטי, ניקוי כימי
• SILIFOOD 1600 — מקביל ל-XIAMETER 1510 · דרגת מזון, ליצרנים שהלקוחות שלהם דורשים אישור מזון
• SILIFOOD 3000 K — מקביל ל-XIAMETER 1520 · דרגת מזון, כנ"ל
• FISIOREX 1000 — חלופה צמחית לחומרי Inolex / SEPPIC · דטרגנטים ירוקים

נשמח לשלוח מפרט טכני ודוגמה לבדיקה במעבדה שלכם, או לתאם שיחת ייעוץ קצרה.

בברכה,
אבשי ספיר
ספירים — Silitex ישראל
050-5231042
avshi@sapirim.com

שמות המותגים שייכים לבעליהם. ההתאמה היא לפי תפקוד ומאושרת סופית בבדיקה אצלכם.`,
  },
];
