// validate.ts (src/lib/validate.ts) · created 22.10.2026 07:20 (Asia/Jerusalem) — ONE place for e-mail / mobile / phone checks used by every intake form: valid → green, invalid → red + hint, already used by another customer / contact → amber warning (e-mail + mobile are the unique keys that auto-route mail and WhatsApp).
import type { Lead, SilitexContact } from "./types";
export type Kind = "email" | "emails" | "mobile" | "phone";
const MAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i;
const digits = (v: string) => v.replace(/[^\d+]/g, "");
/** phone → comparable form: 0XXXXXXXXX for Israel, digits only otherwise */
export const normPhone = (v: string) => { let d = digits(v).replace(/^\+/, "").replace(/^00/, ""); if (d.startsWith("972")) d = "0" + d.slice(3); return d; };
export const splitMails = (v: string) => v.split(/[,;\s]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
/** null = empty (no colour), true = valid, false = invalid */
export function check(kind: Kind, v?: string | null): boolean | null {
  const s = (v || "").trim(); if (!s) return null;
  if (kind === "email") return MAIL_RE.test(s);
  if (kind === "emails") { const m = splitMails(s); return m.length > 0 && m.every((x) => MAIL_RE.test(x)); }
  const raw = digits(s); const intl = /^(\+|00)(?!972)\d{8,14}$/.test(raw); const n = normPhone(s);
  if (kind === "mobile") return /^05\d{8}$/.test(n) || intl;
  return /^0[2-9]\d{7,8}$/.test(n) || /^1[5-8]00\d{6}$/.test(n) || intl;
}
export const HINT: Record<Kind, string> = { email: "אימייל לא תקין — name@company.co.il", emails: "אימייל לא תקין — כמה כתובות מופרדות בפסיק", mobile: "נייד לא תקין — 05X-XXXXXXX או +קידומת", phone: "טלפון לא תקין — 0X-XXXXXXX או +קידומת" };
export type PoolItem = { key: string; label: string; emails: string[]; phones: string[] };
/** everyone who already owns an e-mail / phone: customers + Hub contacts (Silitex + partners) */
export function buildPool(leads: Lead[] = [], contacts: SilitexContact[] = []): PoolItem[] {
  return [
    ...leads.map((l) => ({ key: "lead:" + l.id, label: l.name, emails: splitMails(l.contact_email || ""), phones: [l.contact_phone].filter(Boolean).map((p) => normPhone(String(p))) })),
    ...contacts.map((c) => ({ key: "ct:" + c.id, label: c.name + " (Hub)", emails: splitMails(/^info@/i.test(c.email || "") ? "" : c.email || ""), phones: [c.mobile, c.phone].filter(Boolean).map((p) => normPhone(String(p))) })),
  ];
}
/** name of another record that already uses this e-mail / phone, or null */
export function dupOf(kind: Kind, v: string | undefined, pool: PoolItem[] | undefined, selfKey?: string): string | null {
  if (!pool || !v || check(kind, v) !== true) return null;
  if (kind === "email" || kind === "emails") { const m = splitMails(v); const hit = pool.find((p) => p.key !== selfKey && p.emails.some((e) => m.includes(e))); return hit?.label || null; }
  const n = normPhone(v); const hit = pool.find((p) => p.key !== selfKey && p.phones.includes(n)); return hit?.label || null;
}
export const okCls = (ok: boolean | null) => ok === true ? " !border-emerald-500 !bg-emerald-50 ring-2 !ring-emerald-500 focus:!ring-emerald-500" : ok === false ? " !border-red-400 !bg-red-50 focus:!ring-red-400" : "";
