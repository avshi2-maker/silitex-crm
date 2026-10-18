// mobile-apps.ts (src/config/mobile-apps.ts) · updated 18.10.2026 12:10 (Asia/Jerusalem) — + Silitex Expo (partner) with WhatsApp invite text · 10:30 — phone apps (home-screen web apps) shown on /mobile with a QR to install. Add a line here for every new mobile app.
export const CRM_URL = "https://silitex.marble-art.co.il/";
export const FIELD_URL = "https://silitex-field.marble-art.co.il";
export type MobileApp = { key: string; name: string; path: string; url?: string; who?: "owner" | "partner"; share?: string; icon: string; he: string; status: "live" | "soon" };
export const MOBILE_APPS: MobileApp[] = [
  { key: "field", name: "Silitex Field", path: "/field", url: FIELD_URL, icon: "📱", he: "מצב שטח: אנציקלופדיה לפי תעשייה, צילום / הקלטה לכל פגישה (Cloudinary), פגישה + AI, כרטיס ביקור QR, משימות היום", status: "live" },
  { key: "expo", name: "Silitex Expo", path: "/expo", url: FIELD_URL + "/expo", icon: "🤝", who: "partner", he: "לצוות Silitex (פדריקה) בתערוכות ובביקורים: אנציקלופדיה בלי לקוחות שלך, צילום כרטיס ביקור, פגישה + AI, אנשי קשר ומשימות עם ייצוא ל-Excel, כרטיס ביקור דיגיטלי. הנתונים נשמרים רק בטלפון שלה — לא נוגעים ב-CRM שלך.", status: "live",
    share: "Ciao Federica! Here is Silitex Expo — your pocket assistant for trade shows and customer visits (no laptop needed):\n" + FIELD_URL + "/expo\n\n1) Open the link in Chrome (Android) or Safari (iPhone)\n2) Sign in with your name + personal PIN (once)\n3) Menu ⋮ → Add to Home screen\n\nScan business cards, dictate meeting notes, get an AI summary + next step, keep all contacts and tasks, export to Excel, and share your digital business card by QR. Everything stays on your phone only.\nAvshi" },
];
