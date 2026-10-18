// mobile-apps.ts (src/config/mobile-apps.ts) · updated 18.10.2026 10:30 (Asia/Jerusalem) — phone apps (home-screen web apps) shown on /mobile with a QR to install. Add a line here for every new mobile app.
export const CRM_URL = "https://silitex.marble-art.co.il/";
export const FIELD_URL = "https://silitex-field.marble-art.co.il";
export type MobileApp = { key: string; name: string; path: string; url?: string; icon: string; he: string; status: "live" | "soon" };
export const MOBILE_APPS: MobileApp[] = [
  { key: "field", name: "Silitex Field", path: "/field", url: FIELD_URL, icon: "📱", he: "מצב שטח: אנציקלופדיה לפי תעשייה, צילום / הקלטה לכל פגישה (Cloudinary), פגישה + AI, כרטיס ביקור QR, משימות היום", status: "live" },
];
