// config.ts (src/portal/config.ts) · updated 18.10.2026 17:45 (Asia/Jerusalem) — PUBLIC PORTAL settings. The portal lives at /he /en /ru in this app. It is PRIVATE (PIN + noindex) until PORTAL_PUBLIC=1 in Vercel; then the PORTAL_HOST domain (e.g. www.sapirim.com) serves it publicly and indexable. Canonical URLs always point to PORTAL_URL.
export const PORTAL_LANGS = ["he", "en", "ru"] as const;
export type PLang = (typeof PORTAL_LANGS)[number];
export const isPLang = (s: string): s is PLang => (PORTAL_LANGS as readonly string[]).includes(s);
export const dirOf = (l: PLang) => (l === "he" ? "rtl" : "ltr");
export const PORTAL_URL = (process.env.NEXT_PUBLIC_PORTAL_URL || "https://www.sapirim.com").replace(/\/$/, "");
export const CONTACT = { name: "Avshi Sapir", nameHe: "אבשי ספיר", org: "Sapirim", phone: "+972-50-523-1042", wa: "972505231042", email: "avshi@sapirim.com" };
export const PORTAL_PATH = /^\/(he|en|ru)(\/|$)/;
