// lead-import.ts (src/lib/lead-import.ts) · updated 22.10.2026 17:40 (Asia/Jerusalem) — + Sub-industry column; tier for NEW rows is a parameter (search-prompt imports = Tier 3); unknown industry = "לסיווג" · 17.10.2026 07:45 (Asia/Jerusalem) — Excel / CSV / SAP export → leads. Auto-maps column headers (Hebrew, English, SAP), de-duplicates by company name, builds the template + "export all leads" in the SAME format.
import type { Lead } from "./types";
import { uid } from "./format";

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

/** best guess header → field (exact synonym first, then contains) */
export function autoMap(headers: string[]): Record<number, FieldKey | ""> {
  const out: Record<number, FieldKey | ""> = {}; const used = new Set<FieldKey>();
  headers.forEach((h, i) => { const parts = String(h || "").split("|").map(nrm).filter(Boolean); const f = FIELDS.find((x) => !used.has(x.key) && parts.some((n) => x.syn.includes(n) || n === nrm(x.he) || n === nrm(x.en))); out[i] = f ? f.key : ""; if (f) used.add(f.key); });
  headers.forEach((h, i) => { if (out[i]) return; const n = nrm(h); const f = FIELDS.find((x) => !used.has(x.key) && x.syn.some((s) => s.length > 3 && n.includes(s))); if (f) { out[i] = f.key; used.add(f.key); } });
  return out;
}
const num = (v: unknown) => { const n = Number(String(v ?? "").replace(/[^0-9.\-]/g, "")); return isFinite(n) ? n : 0; };
const dmy = (v: unknown) => { if (typeof v === "number" && v > 20000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 86400000)); return d.toISOString().slice(0, 10).split("-").reverse().join("/"); } const t = String(v ?? "").trim(); const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + "/" + m[2] + "/" + m[1] : t; };

export type ImportRow = { row: Record<FieldKey, string>; existingId?: string; action: "new" | "update" | "skip"; problem?: string };
export function buildRows(data: unknown[][], map: Record<number, FieldKey | "">, existing: Lead[]): ImportRow[] {
  const byName = new Map(existing.map((l) => [normName(l.name), l.id]));
  const seen = new Set<string>();
  return data.map((cells) => {
    const row = Object.fromEntries(FIELDS.map((f) => [f.key, ""])) as Record<FieldKey, string>;
    Object.entries(map).forEach(([i, k]) => { if (k) { const v = cells[Number(i)]; row[k] = k === "last_purchase" ? dmy(v) : String(v ?? "").trim(); } });
    const key = normName(row.name);
    if (!key) return { row, action: "skip" as const, problem: "no company" };
    if (seen.has(key)) return { row, action: "skip" as const, problem: "duplicate in file" };
    seen.add(key);
    const ex = byName.get(key);
    return ex ? { row, existingId: ex, action: "update" as const } : { row, action: "new" as const };
  }).filter((r) => Object.values(r.row).some(Boolean));
}
/** imported row → Lead; on update keeps everything already in the CRM and only fills/refreshes imported fields */
export function toLead(r: ImportRow, existing: Lead[], defaultSource: string, newTier = "Tier 2 - Old account"): Lead {
  const x = r.row; const prev = r.existingId ? existing.find((l) => l.id === r.existingId) : undefined;
  const extra = [x.competitor && "ספק נוכחי: " + x.competitor, x.sap_no && "SAP #" + x.sap_no, x.last_purchase && "רכישה אחרונה: " + x.last_purchase, x.notes].filter(Boolean).join(" · ");
  const keep = (a: string, b?: string) => a || b || "";
  return {
    ...(prev || {}),
    id: prev?.id || uid("LEAD"), name: x.name || prev?.name || "",
    industry: keep(x.industry, prev?.industry) || "לסיווג", sub_industry: keep(x.sub_industry, prev?.sub_industry),
    product_match: keep(x.product_match, prev?.product_match), use_case: keep(x.use_case, prev?.use_case),
    volume_tons: x.volume_tons ? num(x.volume_tons) : prev?.volume_tons || 0, value_usd: x.value_usd ? num(x.value_usd) : prev?.value_usd || 0,
    tier: prev?.tier || newTier, department: prev?.department || "", contact_role: keep(x.contact_role, prev?.contact_role),
    status: prev?.status || "new", stage: prev?.stage || "prospect",
    contact_name: keep(x.contact_name, prev?.contact_name), contact_phone: keep(x.contact_phone, prev?.contact_phone), contact_email: keep(x.contact_email, prev?.contact_email),
    competitor_offset: keep(x.competitor, prev?.competitor_offset), website: keep(x.website, prev?.website), city: keep(x.city, prev?.city),
    notes: [prev?.notes, extra].filter(Boolean).join("\n"), source: keep(x.source, prev?.source) || defaultSource,
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
