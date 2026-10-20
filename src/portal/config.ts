// config.ts (src/portal/config.ts) · updated 20.10.2026 17:55 (Asia/Jerusalem) — + Italian, LinkedIn + AI Facebook page URLs · 17:40 — + LinkedIn / AI Facebook page links · 18.10.2026 17:45 — PUBLIC PORTAL settings. The portal lives at /he /en /ru in this app. It is PRIVATE (PIN + noindex) until PORTAL_PUBLIC=1 in Vercel; then the PORTAL_HOST domain (e.g. www.sapirim.com) serves it publicly and indexable. Canonical URLs always point to PORTAL_URL.
export const PORTAL_LANGS = ["he", "en", "ru", "it"] as const;
export type PLang = (typeof PORTAL_LANGS)[number];
export const isPLang = (s: string): s is PLang => (PORTAL_LANGS as readonly string[]).includes(s);
export const dirOf = (l: PLang) => (l === "he" ? "rtl" : "ltr");
export const PORTAL_URL = (process.env.NEXT_PUBLIC_PORTAL_URL || "https://www.sapirim.com").replace(/\/$/, "");
export const CONTACT = { name: "Avshi Sapir", nameHe: "אבשי ספיר", org: "Sapirim", phone: "+972-50-523-1042", wa: "972505231042", email: "avshi@sapirim.com", linkedin: "https://www.linkedin.com/in/%D7%90%D7%91%D7%A9%D7%99-%D7%A1%D7%A4%D7%99%D7%A8-338a425", facebookAi: "https://www.facebook.com/profile.php?id=61595676957729" };
export const PORTAL_PATH = /^\/(he|en|ru|it)(\/|$)/;
