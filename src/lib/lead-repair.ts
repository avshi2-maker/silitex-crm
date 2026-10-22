// lead-repair.ts (src/lib/lead-repair.ts) · created 22.10.2026 18:45 (Asia/Jerusalem) — repairs SHIFTED columns from AI search answers (NotebookLM 22/10: "url city industry" glued into Website, phone in Role, e-mail in Phone, notes in E-mail). Every value is put back by what it IS: URL / CRM industry / phone / e-mail / "Main products…" notes / job title / person name; the remaining descriptions keep their order → city, sub-industry, application. Used on import rows AND once on the damaged customers.
import { INDUSTRY_LIST } from "@/config/industry-list";

export type Rec = { website: string; city: string; industry: string; sub_industry: string; use_case: string; competitor: string; contact_name: string; contact_role: string; contact_phone: string; contact_email: string; notes: string };
export const REC_KEYS: (keyof Rec)[] = ["website", "city", "industry", "sub_industry", "use_case", "competitor", "contact_name", "contact_role", "contact_phone", "contact_email", "notes"];

const URL_RE = /^(https?:\/\/\S+|www\.\S+)/i;
const PHONE_RE = /^\+?[\d\s\-().]{7,}$/;
const MAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
const NOTES_RE = /^(main products|employees|address|why relevant|confidence|source)\s*:/i;
const ROLE_RE = /^(president|ceo|cto|coo|cfo|owner|founder|co-founder|chairman|vp\b.*|.*\b(manager|director|engineer|chemist|buyer|head of .*|purchasing|procurement)\b.*)$/i;
const NAME_RE = /^[A-Z][a-zA-Z.'-]*(\s+[A-Z][a-zA-Z.'-]*){0,3}$|^[֐-׿"'\s]{3,30}$/;
const indOf = (v: string) => INDUSTRY_LIST.find((x) => x.toLowerCase() === v.trim().toLowerCase());
const indSuffix = (v: string) => INDUSTRY_LIST.find((x) => v.trim().toLowerCase().endsWith(" " + x.toLowerCase()) || v.trim().toLowerCase() === x.toLowerCase());

/** does this record look column-shifted? */
export function looksShifted(r: Rec): boolean {
  const glued = /^https?:\/\/\S+\s+\S/.test(r.website.trim());
  const misplaced = [r.contact_role, r.contact_phone, r.contact_email, r.contact_name, r.competitor].some((v) => NOTES_RE.test(v.trim()))
    || (!!r.contact_role && (PHONE_RE.test(r.contact_role.trim()) || MAIL_RE.test(r.contact_role.trim())))
    || (!!r.contact_phone && MAIL_RE.test(r.contact_phone.trim())) || (!!r.competitor && (PHONE_RE.test(r.competitor.trim()) || MAIL_RE.test(r.competitor.trim())))
    || (!!r.contact_name && (PHONE_RE.test(r.contact_name.trim()) || MAIL_RE.test(r.contact_name.trim())))
    || (!!r.city && !!indOf(r.city));
  return glued || misplaced;
}

/** put every value back where it belongs (only call when looksShifted) */
export function repairRec(r: Rec): Rec {
  const out: Rec = { website: "", city: "", industry: "", sub_industry: "", use_case: "", competitor: "", contact_name: "", contact_role: "", contact_phone: "", contact_email: "", notes: "" };
  const vals: string[] = [];
  const w = r.website.trim(); const m = w.match(/^(\S+)\s+(.*)$/);
  if (m && URL_RE.test(m[1])) { out.website = m[1]; let rest = m[2].trim(); const ind = indSuffix(rest); if (ind) { out.industry = ind; rest = rest.slice(0, rest.length - ind.length).trim(); } if (rest) out.city = rest; }
  else if (w) vals.push(w);
  for (const k of ["city", "industry", "sub_industry", "use_case", "competitor", "contact_name", "contact_role", "contact_phone", "contact_email"] as (keyof Rec)[]) { const v = (r[k] || "").trim(); if (v) vals.push(v); }
  const notes: string[] = []; const texts: string[] = [];
  for (const v of vals) {
    if (!out.website && URL_RE.test(v) && !/\s/.test(v)) out.website = v;
    else if (indOf(v)) { if (!out.industry) out.industry = indOf(v)!; }
    else if (MAIL_RE.test(v)) out.contact_email = out.contact_email ? out.contact_email + ", " + v : v;
    else if (PHONE_RE.test(v)) { if (!out.contact_phone) out.contact_phone = v; else notes.push("Phone: " + v); }
    else if (NOTES_RE.test(v)) notes.push(v);
    else if (v.length <= 40 && ROLE_RE.test(v)) out.contact_role = v;
    else texts.push(v);
  }
  // a short proper name right before / among the descriptions = the contact person
  const ni = texts.findIndex((t) => t.length <= 30 && NAME_RE.test(t) && !/(moulding|extrusion|agents|additives|lubricants|processing|plastic|rubber|foam|film|pipe)/i.test(t) && (out.contact_role || /\./.test(t)));
  if (ni >= 0) out.contact_name = texts.splice(ni, 1)[0];
  if (!out.city && texts.length >= 3) out.city = texts.shift()!;
  if (texts.length) out.sub_industry = texts.shift()!;
  if (texts.length) out.use_case = texts.shift()!;
  if (texts.length) notes.push(...texts);
  // old notes: drop the "ספק נוכחי: <phone / e-mail / title>" junk the shift created, keep the rest
  const moved = new Set([out.contact_name, out.contact_role, out.contact_phone, out.contact_email].filter(Boolean));
  const keep = (r.notes || "").split(/\n| · /).map((s) => s.trim()).filter((s) => s && !(/^ספק נוכחי:\s*/.test(s) && (() => { const v = s.replace(/^ספק נוכחי:\s*/, ""); return moved.has(v) || PHONE_RE.test(v) || MAIL_RE.test(v) || ROLE_RE.test(v) || NOTES_RE.test(v); })()));
  out.notes = Array.from(new Set([...keep, ...notes])).join("\n");
  if (!out.city) { const a = notes.join(" ").match(/Address:\s*([^;]+)/i); if (a) { const parts = a[1].split(",").map((s) => s.trim()).filter((s) => s && !/^israel$/i.test(s) && !/^\d+$/.test(s)); if (parts.length) out.city = parts[parts.length - 1]; } }
  return out;
}
