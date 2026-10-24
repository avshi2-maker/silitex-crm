// lead-import.ts (src/lib/lead-import.ts) · updated 23.10.2026 06:40 (Asia/Jerusalem) — an update never renames a customer · industry outside the CRM list → search industry (or לסיווג) + text kept as sub-industry · a URL / removed link in the Source column becomes the website, not the source label · 05:20 — smarter duplicate check (name without "(Hebrew)" / generic words, website domain, name prefix) + an update only FILLS EMPTY fields (NotebookLM had overwritten good Gemini websites) · 22.10.2026 18:50 (Asia/Jerusalem) — rows with SHIFTED columns (AI answers, NotebookLM 22/10) are repaired automatically (lib/lead-repair) and flagged 🔧 · 17:40 (Asia/Jerusalem) — + Sub-industry column; tier for NEW rows is a parameter (search-prompt imports = Tier 3); unknown industry = "לסיווג" · 17.10.2026 07:45 (Asia/Jerusalem) — Excel / CSV / SAP export → leads. Auto-maps column headers (Hebrew, English, SAP), de-duplicates by company name, builds the template + "export all leads" in the SAME format.
import type { Lead } from "./types";
import { uid } from "./format";
import { looksShifted, repairRec, REC_KEYS, type Rec } from "./lead-repair";
import { isUnclassified, allIndustries } from "@/config/industry-list";

export type FieldKey = "name" | "contact_name" | "contact_role" | "contact_phone" | "contact_email" | "industry" | "sub_industry" | "product_match" | "competitor" | "use_case" | "volume_tons" | "value_usd" | "city" | "sap_no" | "last_purchase" | "website" | "notes" | "source";
/** column order = the template / export format */
export const FIELDS: { key: FieldKey; he: string; en: string; required?: boolean; syn: string[] }[] = [
  { key: "name", he: "חברה", en: "Company", required: true, syn: ["company", "customer", "customer name", "name", "name 1", "account", "kunde", "client", "חברה", "שם חברה", "לקוח", "שם לקוח"] },
  { key: "contact_name", he: "איש קשר", en: "Contact name", syn: ["contact", "contact name", "contact person", "ansprechpartner", "איש קשר", "שם איש קשר"] },
  { key: "contact_role", he: "תפקיד", en: "Role", syn: ["role", "title", "position", "function", "job title", "תפקיד"] },
  { key: "contact_phone", he: "טלפון / נייד", en: "Phone", syn: ["phone", "mobile", "tel", "telephone", "telephone 1", "cell", "טלפון", "נייד", "פלאפון"] },
  { key: "contact_email", he: "אימייל", en: "Email", syn: ["email", "e-mail", "e-mail address", "mail", "אימייל", "מייל", "דואל"] },
  { key: "industry", he: "תעשייה", en: "Industry", syn: ["industry", "sector", "segment", "industry key", "branche", "תעשייה", "ענף", "סקטור"] },
  { key: "sub_industry", he: "תת-ענף", en: "Sub-industry", syn: ["sub industry", "subindustry", "sub sector", "sub segment", "niche", "תת ענף", "תת-ענף", "תחום"] },
  { key: "product_match", he: "מוצר בשימוש היום", en: "Product used today", syn: ["product", "material", "material description", "product used", "current product", "item", "מוצר", "מוצר בשימוש", "פריט"] },
  { key: "competitor", he: "ספק / מתחרה נוכחי", en: "Current supplier", syn: ["supplier", "current supplier", "competitor", "vendor", "brand", "ספק", "מתחרה", "ספק נוכחי"] },
  { key: "use_case", he: "יישום / צורך", en: "Application", syn: ["application", "use", "use case", "need", "process", "יישום", "צורך", "שימוש"] },
  { key: "volume_tons", he: "כמות שנתית (טון)", en: "Annual volume (t)", syn: ["volume", "tons", "tonnes", "qty", "quantity", "annual volume", "כמות", "טון", "כמות שנתית"] },
  { key: "value_usd", he: "פוטנציאל $ / שנה", en: "Annual value ($)", syn: ["value", "sales", "revenue", "turnover", "amount", "usd", "net value", "מחזור", "שווי", "פוטנציאל"] },
  { key: "city", he: "עיר", en: "City", syn: ["city", "town", "location", "ort", "עיר", "ישוב", "מיקום"] },
  { key: "sap_no", he: "מס' לקוח SAP", en: "SAP customer no.", syn: ["sap", "customer no", "customer number", "account number", "debitor", "kunnr", "sold-to", "מספר לקוח", "מס לקוח"] },
  { key: "last_purchase", he: "רכישה אחרונה", en: "Last purchase", syn: ["last purchase", "last order", "last invoice", "date", "רכישה אחרונה", "הזמנה אחרונה", "תאריך"] },
  { key: "website", he: "אתר", en: "Website", syn: ["website", "web", "url", "site", "אתר"] },
  { key: "notes", he: "הערות", en: "Notes", syn: ["notes", "remarks", "comment", "comments", "memo", "הערות", "הערה"] },
  { key: "source", he: "מקור", en: "Source", syn: ["source", "lead source", "origin", "מקור"] },
];
const nrm = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9֐-׿]+/g, " ").trim();
export const normName = (s: string) => nrm(s).replace(/\b(ltd|inc|co|bv|srl|spa|gmbh|בע מ|בעמ)\b/g, "").replace(/\s+/g, " ").trim();
/** duplicate key: no "(Hebrew name)", no legal / generic words, letters only — "R.O.P. Ltd." = "ROP Industries", "Tama Group (תמה…)" = "Tama Plastic Industry" */
export const dupKey = (s: string) => nrm(String(s || "").replace(/\([^)]*\)/g, " ")).replace(/\b(ltd|inc|co|bv|srl|spa|gmbh|group|industries|industry|company|companies|products|product|plastic|plastics|technology|technologies|international|israel|il|the|and|\d{4})\b/g, " ").replace(/[^a-z0-9֐-׿]/g, "");
/** "kafrit.com" (NotebookLM plain domain) → "https://kafrit.com" */
export const fullUrl = (u: string) => { const t = (u || "").trim(); return !t || /^https?:\/\//i.test(t) || !/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(t.replace(/^www\./i, "")) ? t : "https://" + t; };
export const domainOf = (u?: string) => { const m = String(u || "").toLowerCase().match(/^(?:https?:\/\/)?(?:www\.)?([^/\s?#]+)/); return m && m[1].includes(".") ? m[1] : ""; };
/** existing customer that is the same company: same key, same website domain, or one key is the start of the other (≥ 5 letters) */
export function findDup(name: string, website: string, existing: Lead[]): Lead | undefined {
  const k = dupKey(name), d = domainOf(website); if (!k && !d) return undefined;
  return existing.find((l) => { const lk = dupKey(l.name); return (!!k && lk === k) || (!!d && domainOf(l.website) === d) || (!!k && !!lk && Math.min(k.length, lk.length) >= 5 && (k.startsWith(lk) || lk.startsWith(k))); });
}

/** best guess header → field (exact synonym first, then contains) */
export function autoMap(headers: string[]): Record<number, FieldKey | ""> {
  const out: Record<number, FieldKey | ""> = {}; const used = new Set<FieldKey>();
  headers.forEach((h, i) => { const parts = String(h || "").split("|").map(nrm).filter(Boolean); const f = FIELDS.find((x) => !used.has(x.key) && parts.some((n) => x.syn.includes(n) || n === nrm(x.he) || n === nrm(x.en))); out[i] = f ? f.key : ""; if (f) used.add(f.key); });
  headers.forEach((h, i) => { if (out[i]) return; const n = nrm(h); const f = FIELDS.find((x) => !used.has(x.key) && x.syn.some((s) => s.length > 3 && n.includes(s))); if (f) { out[i] = f.key; used.add(f.key); } });
  return out;
}
const num = (v: unknown) => { const n = Number(String(v ?? "").replace(/[^0-9.\-]/g, "")); return isFinite(n) ? n : 0; };
const dmy = (v: unknown) => { if (typeof v === "number" && v > 20000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 86400000)); return d.toISOString().slice(0, 10).split("-").reverse().join("/"); } const t = String(v ?? "").trim(); const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + "/" + m[2] + "/" + m[1] : t; };

export type ImportRow = { row: Record<FieldKey, string>; existingId?: string; action: "new" | "update" | "skip"; problem?: string; fixed?: boolean };
export function buildRows(data: unknown[][], map: Record<number, FieldKey | "">, existing: Lead[]): ImportRow[] {
  const byName = new Map(existing.map((l) => [normName(l.name), l.id]));
  const seen = new Set<string>();
  return data.map((cells) => {
    const row = Object.fromEntries(FIELDS.map((f) => [f.key, ""])) as Record<FieldKey, string>;
    Object.entries(map).forEach(([i, k]) => { if (k) { const v = cells[Number(i)]; row[k] = k === "last_purchase" ? dmy(v) : String(v ?? "").trim(); } });
    let fixed = false; const rec = Object.fromEntries(REC_KEYS.map((k) => [k, row[k as FieldKey] || ""])) as Rec;
    if (looksShifted(rec)) { const rp = repairRec(rec); REC_KEYS.forEach((k) => { row[k as FieldKey] = rp[k]; }); fixed = true; } // AI answer with shifted columns → each value back to its field
    const key = normName(row.name);
    if (!key) return { row, action: "skip" as const, problem: "no company" };
    if (seen.has(key)) return { row, action: "skip" as const, problem: "duplicate in file" };
    seen.add(key);
    const ex = byName.get(key) || findDup(row.name, row.website, existing)?.id;
    return ex ? { row, existingId: ex, action: "update" as const, fixed } : { row, action: "new" as const, fixed };
  }).filter((r) => Object.values(r.row).some(Boolean));
}
/** imported row → Lead; on update keeps everything already in the CRM and only fills/refreshes imported fields */
export function toLead(r: ImportRow, existing: Lead[], defaultSource: string, newTier = "Tier 2 - Old account", searchIndustry = ""): Lead {
  const x = r.row; const prev = r.existingId ? existing.find((l) => l.id === r.existingId) : undefined;
  const extra = [x.competitor && "ספק נוכחי: " + x.competitor, x.sap_no && "SAP #" + x.sap_no, x.last_purchase && "רכישה אחרונה: " + x.last_purchase, x.notes].filter(Boolean).join(" · ");
  // AI answers: an industry outside the CRM list → the search's industry (or "לסיווג" for the scan to classify), its text kept as sub-industry; a "source" that is a URL / removed link is not a source label (it is the website)
  const badInd = !!x.industry && !allIndustries().includes(x.industry) && !isUnclassified(x.industry) && !existing.some((l) => l.industry === x.industry);
  const rowInd = badInd ? searchIndustry || "לסיווג" : x.industry;
  const srcIsLink = /^(https?:\/\/|www\.)|\[suspicious link removed\]/i.test(x.source || ""); const srcOk = !!x.source && !srcIsLink;
  if (srcIsLink && !x.website && /^(https?:\/\/|www\.)/i.test(x.source)) x.website = x.source;
  const keep = (a: string, b?: string) => (prev ? b || a : a || b) || ""; // update = fill only what is still EMPTY (a weaker answer never overwrites good data)
  return {
    ...(prev || {}),
    id: prev?.id || uid("LEAD"), name: prev?.name || x.name || "", // an update never renames an existing customer
    industry: (prev && !isUnclassified(prev.industry) ? prev.industry : rowInd || prev?.industry) || "לסיווג", sub_industry: keep(x.sub_industry || (badInd ? x.industry : ""), prev?.sub_industry),
    product_match: keep(x.product_match, prev?.product_match), use_case: keep(x.use_case, prev?.use_case),
    volume_tons: x.volume_tons ? num(x.volume_tons) : prev?.volume_tons || 0, value_usd: x.value_usd ? num(x.value_usd) : prev?.value_usd || 0,
    tier: prev?.tier || newTier, department: prev?.department || "", contact_role: keep(x.contact_role, prev?.contact_role),
    status: prev?.status || "new", stage: prev?.stage || "prospect",
    contact_name: keep(x.contact_name, prev?.contact_name), contact_phone: keep(x.contact_phone, prev?.contact_phone), contact_email: keep(x.contact_email, prev?.contact_email),
    competitor_offset: keep(x.competitor, prev?.competitor_offset), website: keep(fullUrl(x.website), prev?.website), city: keep(x.city, prev?.city),
    notes: [prev?.notes, extra].filter(Boolean).join("\n"), source: keep(srcOk ? x.source : "", prev?.source) || defaultSource,
  } as Lead;
}
/** leads → rows in the template format (for "export all" and the empty template) */
export function leadsToSheet(leads: Lead[]): (string | number)[][] {
  const head = FIELDS.map((f) => f.he + " | " + f.en);
  const rows = leads.map((l) => FIELDS.map((f) => {
    switch (f.key) {
      case "name": return l.name; case "contact_name": return l.contact_name || ""; case "contact_role": return l.contact_role || ""; case "contact_phone": return l.contact_phone || ""; case "contact_email": return l.contact_email || "";
      case "industry": return l.industry || ""; case "sub_industry": return l.sub_industry || ""; case "product_match": return l.product_match || ""; case "competitor": return l.competitor_offset || ""; case "use_case": return l.use_case || "";
      case "volume_tons": return l.volume_tons || ""; case "value_usd": return l.value_usd || ""; case "website": return l.website || ""; case "city": return l.city || ""; case "notes": return l.notes || ""; case "source": return l.source || "";
      default: return "";
    }
  }));
  return [head, ...rows];
}
