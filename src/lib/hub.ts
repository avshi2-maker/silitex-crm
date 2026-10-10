// hub.ts (src/lib/hub.ts) · updated 10.10.2026 07:30 (Asia/Jerusalem)
// Hub helpers: parse a pasted email, auto-match department / shipment / lead / SKU / P/O, waiting-alert, thread text.
import { deptOf, WAITING_ALERT_DAYS, DEPTS, THREAD_STATUS } from "@/config/hub";
import { PRODUCTS } from "@/lib/data";
import { fmtDateTime } from "@/lib/format";
import type { Lead, Shipment, Thread, HubMsg } from "@/lib/types";
export type Parsed = { from: string; to: string; subject: string; at: string; body: string };
export function parseEmail(raw: string): Parsed {
  const h = (k: string) => (raw.match(new RegExp("^\\s*" + k + "\\s*:\\s*(.+)$", "im")) || [])[1]?.trim() || "";
  const from = h("From|Da|מאת"), to = h("To|A|אל"), subject = h("Subject|Oggetto|נושא"), sent = h("Sent|Date|Inviato|נשלח");
  const at = sent && !isNaN(new Date(sent).getTime()) ? new Date(sent).toISOString() : new Date().toISOString();
  const body = raw.replace(/^\s*(From|Da|מאת|To|A|אל|Cc|Subject|Oggetto|נושא|Sent|Date|Inviato|נשלח)\s*:.*$/gim, "").trim();
  return { from, to, subject, at, body };
}
export function matchRefs(text: string, leads: Lead[], shipments: Shipment[]): { shipment_id?: string; shipment_ref?: string; lead_id?: string; lead_name?: string; sku?: string; po?: string; invoice?: string; lot?: string } {
  const t = text; const out: ReturnType<typeof matchRefs> = {};
  const shp = t.match(/SHP-\d{4}-\d{3}/i); if (shp) { const s = shipments.find((x) => x.ref.toUpperCase() === shp[0].toUpperCase()); if (s) { out.shipment_id = s.id; out.shipment_ref = s.ref; if (s.lead_id) { out.lead_id = s.lead_id; out.lead_name = s.lead_name; } } }
  if (!out.lead_id) { const l = leads.find((x) => x.name && t.toLowerCase().includes(x.name.split(" (")[0].toLowerCase())); if (l) { out.lead_id = l.id; out.lead_name = l.name; } }
  const p = PRODUCTS.find((x) => t.toUpperCase().includes(x.product_name.split(" /")[0].toUpperCase())); if (p) out.sku = p.product_name;
  const po = t.match(/\b(?:P\/?O|PO|order|ordine)\s*(?:no\.?|n\.?|#|:)?\s*([A-Z0-9-]{3,})/i); if (po) out.po = po[1];
  const inv = t.match(/\b(?:invoice|fattura|inv\.?)\s*(?:no\.?|n\.?|#|:)?\s*([A-Z0-9/-]{3,})/i); if (inv) out.invoice = inv[1];
  const lot = t.match(/\b(?:lot|lotto|batch)\s*(?:no\.?|n\.?|#|:)?\s*([A-Z0-9/-]{3,})/i); if (lot) out.lot = lot[1];
  return out;
}
export const guessDept = (subject: string, body: string) => deptOf(subject + " " + body.slice(0, 600));
export const isOutbound = (from: string) => /sapirim\.com|marble-art\.co\.il/i.test(from) || !/silitex\.it/i.test(from);
export const statusHe = (th: Pick<Thread, "dept" | "status">) => th.dept === "il" && th.status === "waiting_silitex" ? "ממתין ללקוח" : THREAD_STATUS.find((s) => s.key === th.status)?.he || th.status;
export function waitingDays(th: Thread): number { if (th.status !== "waiting_silitex" && th.status !== "waiting_us") return 0; return Math.floor((Date.now() - new Date(th.last_at).getTime()) / 864e5); }
export const isLate = (th: Thread) => waitingDays(th) >= WAITING_ALERT_DAYS;
export function threadText(th: Thread, msgs: HubMsg[]): string {
  const d = DEPTS.find((x) => x.key === th.dept);
  return "Thread: " + th.subject + "\nDepartment: " + (d?.en || th.dept) + " · Topic: " + th.topic + " · Status: " + th.status + "\nRefs: " + [th.refs.shipment_ref && "shipment " + th.refs.shipment_ref, th.refs.lead_name && "account " + th.refs.lead_name, th.refs.po && "P/O " + th.refs.po, th.refs.sku && "SKU " + th.refs.sku, th.refs.lot && "lot " + th.refs.lot, th.refs.invoice && "invoice " + th.refs.invoice].filter(Boolean).join(" · ") + (th.due ? "\nDue: " + th.due : "") + "\n\n" + msgs.map((m) => "[" + fmtDateTime(m.at) + "] " + (m.direction === "out" ? "WE → Silitex" : "Silitex → us") + " (" + m.from + ")\n" + m.body).join("\n\n---\n\n");
}
