// shipping.ts (src/lib/shipping.ts) · updated 10.10.2026 05:30 (Asia/Jerusalem)
// Shipment helpers: prefill from lead/intake, build the EN+IT data-request text, CSV form for Silitex to fill, completeness.
import { SHIPPING, SHIP_FIELDS, SHIP_DOCS, IMPORTER, PORTS, type ShipField } from "@/config/shipping";
import { PRODUCTS } from "@/lib/data";
import { intakeOf } from "@/lib/intake";
import { fmtDate } from "@/lib/format";
import type { Lead, Shipment, ShipLine } from "@/lib/types";
export function prefill(lead: Lead | undefined, consignee: Shipment["consignee"], mode: Shipment["mode"]): Record<string, string> {
  const v: Record<string, string> = {};
  SHIP_FIELDS.forEach((f) => { if (f.def) v[f.id] = f.def; });
  v.TR_MODE = mode === "air" ? "Air" : "Sea LCL"; v.TR_POD = mode === "air" ? PORTS.air_pod[0] : PORTS.sea_pod[0];
  if (consignee === "customer" && lead) {
    const i = intakeOf(lead);
    v.CNE_NAME = lead.name; v.CNE_VAT = i.ACC_003 || ""; v.CNE_ADDR = i.ACC_004 || lead.city || ""; v.CNE_CONTACT = [lead.contact_name, lead.contact_phone, lead.contact_email].filter(Boolean).join(" · ") || "";
    v.TR_INCO = /DDP/.test(i.COM_003 || "") ? "DDP plant" : /CIF/.test(i.COM_003 || "") ? "CIF Haifa" : "DAP plant";
    v.CNE_PERMIT = "Customer to confirm (poisons permit if SKU is regulated)";
  }
  return v;
}
export function linesText(lines: ShipLine[]): string {
  return lines.map((l) => { const p = PRODUCTS.find((x) => x.product_name === l.sku); return "- " + l.sku + " — " + l.kg + " kg — " + l.pack + (p ? " — " + p.category_sector + (p.inci_chemical_name ? " — INCI: " + p.inci_chemical_name : "") + (p.food_grade_certifications ? " — " + p.food_grade_certifications : "") : ""); }).join("\n");
}
export function pct(s: Shipment): number {
  const req = SHIP_FIELDS.filter((f) => f.req === "M"); const filled = req.filter((f) => (s.values[f.id] || "").trim()).length;
  const docs = SHIP_DOCS.filter((d) => s.docs[d.key]).length;
  return Math.round(((filled + docs) / (req.length + SHIP_DOCS.length)) * 100);
}
const who = (w: ShipField["who"]) => ({ sapirim: "Sapirim", silitex: "SILITEX", forwarder: "FORWARDER", customer: "CUSTOMER" }[w]);
export function requestText(s: Shipment): string {
  const head = "SHIPMENT DATA REQUEST / RICHIESTA DATI SPEDIZIONE — " + s.ref + " · " + fmtDate(s.created_at) + "\nItaly → Israel · " + (s.mode === "air" ? "Air freight" : "Sea freight") + " · " + (s.values.TR_INCO || "") + "\nConsignee: " + (s.consignee === "customer" ? s.lead_name : IMPORTER.name) + "\n\nGOODS / MERCE:\n" + linesText(s.lines) + "\n\nPlease fill every field marked [SILITEX] or [FORWARDER]. Mandatory = *, Conditional = (c). Fields marked [Sapirim] are provided by us.\nSi prega di compilare i campi [SILITEX] / [FORWARDER]. Obbligatorio = *, condizionale = (c).\n";
  const body = SHIPPING.map((sec) => sec.n + ". " + sec.en + " / " + sec.it + "\n" + sec.fields.map((f) => "  " + (f.req === "M" ? "* " : f.req === "C" ? "(c) " : "  ") + f.en + " / " + f.it + " [" + who(f.who) + "]: " + (s.values[f.id] || "__________") + (f.note ? "\n      ↳ " + f.note : "")).join("\n")).join("\n\n");
  const docs = "\n\nDOCUMENTS TO ATTACH / DOCUMENTI DA ALLEGARE:\n" + SHIP_DOCS.map((d) => "  [" + (s.docs[d.key] ? "x" : " ") + "] " + d.en + " [" + who(d.who) + "]").join("\n");
  return head + "\n" + body + docs + "\n\n" + IMPORTER.name + " · VAT " + IMPORTER.vat + " · " + IMPORTER.contact;
}
export function requestCsv(s: Shipment): string {
  const esc = (x: string) => '"' + String(x || "").replace(/"/g, '""') + '"';
  const rows = [["Section", "Field_ID", "Field_EN", "Field_IT", "Field_HE", "Mandatory", "Fill_by", "Value", "Purpose", "Note"]];
  SHIPPING.forEach((sec) => sec.fields.forEach((f) => rows.push([sec.n + ". " + sec.en, f.id, f.en, f.it, f.he, f.req, who(f.who), s.values[f.id] || "", f.purpose, f.note || ""])));
  SHIP_DOCS.forEach((d) => rows.push(["8. Documents", "DOC_" + d.key.toUpperCase(), d.en, "", d.he, "M", who(d.who), s.docs[d.key] ? "attached" : "", "", ""]));
  return "﻿" + rows.map((r) => r.map(esc).join(",")).join("\n");
}
export function nextRef(existing: Shipment[]): string { const y = new Date().getFullYear(); return "SHP-" + y + "-" + String(existing.filter((x) => x.ref.includes(String(y))).length + 1).padStart(3, "0"); }
