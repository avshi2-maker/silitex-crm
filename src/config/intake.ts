// intake.ts (src/config/intake.ts) · updated 09.10.2026 19:30 (Asia/Jerusalem)
// Technical fact-finding form (8 sections) used in the lead file. Source: silitex_customer_intake_fact_finding_form.csv (NotebookLM, 09/10/2026).
// Core identity fields (company, contact, mobile, email, industry) live on the Lead itself; everything here is stored in lead.intake[Field_ID].
export type IntakeField = { id: string; he: string; type: "text" | "select" | "multi" | "number" | "date"; req?: boolean; hint: string; options?: string[] };
export type IntakeSection = { n: number; he: string; icon: string; fields: IntakeField[] };
const YNP = ["", "Yes", "No", "Preferred"];
export const INTAKE: IntakeSection[] = [
  { n: 1, he: "פרופיל חברה", icon: "🏭", fields: [
    { id: "ACC_003", he: "ח.פ. / מספר עוסק", type: "text", hint: "לבדיקת אשראי וחשבונית" },
    { id: "ACC_004", he: "מפעל / כתובת אספקה", type: "text", req: true, hint: "המפעל שאליו נשלחים הדגימה והסחורה" },
    { id: "ACC_005", he: "אתר אינטרנט", type: "text", hint: "" } ] },
  { n: 2, he: "אנשי קשר", icon: "👤", fields: [
    { id: "CON_004", he: "כימאי ראשי / מנהל R&D", type: "text", hint: "מי מאשר טכנית — לרוב לא הקניין" },
    { id: "CON_005", he: "קניין / רכש", type: "text", hint: "מי חותם על ההזמנה" },
    { id: "CON_006", he: "מנהל איכות / רגולציה", type: "text", hint: "רלוונטי ל-FDA / כשרות / REACH" } ] },
  { n: 3, he: "יישום ותהליך", icon: "⚗️", fields: [
    { id: "APP_001", he: "מוצר סופי / יישום", type: "text", req: true, hint: "הפורמולציה הספציפית, למשל: נוגד קצף לדטרגנט נוזלי" },
    { id: "APP_002", he: "טווח pH בתהליך", type: "text", req: true, hint: "חומצי / ניטרלי / בסיסי — טיח יבש pH 12–13, ריסוס חקלאי 4.5–8.5" },
    { id: "APP_003", he: "טמפרטורה (°C)", type: "text", req: true, hint: "תהליך ואחסון — זיקוק >200°C דורש פולימר עמיד" },
    { id: "APP_004", he: "מערכת נשא / מטריצה", type: "select", req: true, hint: "", options: ["", "Water-based emulsion", "Anhydrous / solvent-free", "Solvent-based", "Polyol", "Dry powder / water-dilutable"] },
    { id: "APP_005", he: "פונקציה נדרשת", type: "multi", req: true, hint: "אפשר כמה", options: ["Super-spreading", "Defoaming", "Water repellency", "Softening", "High slip", "Mold release", "Anti-cratering", "Lubrication"] },
    { id: "APP_006", he: "יעד ביצועים מדיד", type: "text", hint: "למשל: מתח פנים <22 mN/m, foam knock-down תוך 30 שניות" } ] },
  { n: 4, he: "ספק נוכחי (Benchmark)", icon: "🎯", fields: [
    { id: "BEN_001", he: "ספק / מותג נוכחי", type: "select", req: true, hint: "", options: ["", "Dow Corning / XIAMETER / DOWSIL", "Wacker", "Momentive", "Evonik", "Shin-Etsu", "Elkem", "BRB", "Clariant", "Other"] },
    { id: "BEN_002", he: "מק\"ט / דרגה נוכחית", type: "text", req: true, hint: "שם מסחרי שנרכש היום — הזן ב-Offset Sniper" },
    { id: "BEN_003", he: "סיבה לחלופה", type: "multi", req: true, hint: "", options: ["Cost reduction", "Lead time", "REACH / D4-D5", "Technical issue", "Single source", "Local support"] },
    { id: "BEN_004", he: "מחיר נוכחי (EUR/kg, אם ידוע)", type: "number", hint: "לקביעת רף להצעה" } ] },
  { n: 5, he: "רגולציה ותאימות", icon: "📜", fields: [
    { id: "REG_001", he: "נדרש ללא D4/D5/D6 (REACH <0.1%)", type: "select", req: true, hint: "אם 'Yes' — רק קווים לא-ציקליים (MACROAMISIL / MICROAMISIL / IDROAMISIL / FISIOREX)", options: YNP },
    { id: "REG_002", he: "מגע מזון / FDA 21 CFR", type: "select", req: true, hint: "SILIFOOD / CPL 350", options: YNP },
    { id: "REG_003", he: "כשרות (בד\"ץ / רבנות)", type: "select", req: true, hint: "", options: YNP },
    { id: "REG_004", he: "תקני ירוק", type: "multi", hint: "", options: ["100% bio-based", "GOTS-ICEA", "EU Eco-Label", "Zero VOC", "EN 1504-2"] } ] },
  { n: 6, he: "התאמת Silitex ודגימה", icon: "🧪", fields: [
    { id: "SIL_001", he: "מוצר Silitex מומלץ", type: "text", hint: "מהקטלוג בלבד — אם אין התאמה: 'לשאול מעבדת Silitex'" },
    { id: "SIL_002", he: "גודל דגימה", type: "select", req: true, hint: "", options: ["", "1 kg", "2 kg", "5 kg", "25 kg pilot"] },
    { id: "SIL_003", he: "מסמכים נדרשים לדגימה", type: "multi", req: true, hint: "", options: ["TDS", "SDS §3", "CoA", "REACH D4/D5 statement", "Kosher certificate", "FDA letter"] },
    { id: "SIL_004", he: "הערות מעבדה / פרוטוקול בדיקה", type: "text", hint: "מה הלקוח מודד ואיך" } ] },
  { n: 7, he: "מסחרי ולוגיסטיקה", icon: "💶", fields: [
    { id: "COM_001", he: "כמות שנתית משוערת (טון)", type: "number", req: true, hint: "" },
    { id: "COM_002", he: "אריזה מועדפת", type: "select", req: true, hint: "", options: ["", "25 kg pails", "200 kg drums", "1000 L IBC", "Bulk tanker"] },
    { id: "COM_003", he: "מודל אספקה / Incoterm", type: "select", req: true, hint: "DDP ממלאי מקומי או משלוח ישיר לפי הזמנה", options: ["", "DDP plant (local stock)", "Direct drop-ship per PO (DDP plant)", "CIF Ashdod / Haifa", "FCA Italy"] },
    { id: "COM_004", he: "תנאי תשלום יעד", type: "select", req: true, hint: "", options: ["", "CAD", "Irrevocable LC", "Net 30", "Net 60", "Net 90"] } ] },
  { n: 8, he: "מעקב צנרת", icon: "📅", fields: [
    { id: "TRK_001", he: "יעד לתוצאות מעבדה", type: "date", req: true, hint: "" },
    { id: "TRK_002", he: "גודל הזמנת פיילוט", type: "text", req: true, hint: "למשל: 1 × IBC (1 טון)" },
    { id: "TRK_003", he: "נציג מכירות", type: "text", hint: "", } ] },
];
export const INTAKE_FIELDS = INTAKE.flatMap((s) => s.fields);
