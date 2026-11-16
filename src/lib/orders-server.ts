// orders-server.ts (src/lib/orders-server.ts) · created 16.11.2026 18:40 (Asia/Jerusalem) — v1.14.0 📦 server-only order helpers, shared by /api/orders, ✨ fill-from-mail and the 🤖 back-office agent
// createOrder: own number (ORD-S / ORD-P from DB sequences), pre-filled from the project's Silitex answer + the customer card (+ optional AI-read fields)
// applyParsed: merges what AI read from the customer's mail into an order — fills what is empty / placeholder, never overwrites your typing
import type { serviceClient } from "./server-data";
import type { Order, OrderLine } from "./types";
type SB = NonNullable<ReturnType<typeof serviceClient>>;

export type Parsed = { kind?: string; lines?: Partial<OrderLine>[]; delivery_address?: string; contact?: string; phone?: string; email?: string; customer_po?: string; notes?: string };

export async function createOrder(sb: SB, b: { kind: "sample" | "product"; project_id?: string | null; lead_id?: string | null; parsed?: Parsed; note?: string }): Promise<Order> {
  const kind = b.kind;
  const prj = b.project_id ? (await sb.from("projects").select("*").eq("id", b.project_id).maybeSingle()).data : null;
  const leadId = (prj?.lead_id as string) || b.lead_id; if (!leadId) throw new Error("project_id or lead_id required");
  const lead = (await sb.from("leads").select("id,name,contact_name,contact_role,contact_email,contact_phone,address,city").eq("id", leadId).maybeSingle()).data;
  const ans = (prj?.silitex_answer || {}) as { grade?: string; code?: string; price?: string; pack?: string };
  const firstPrice = Number(String(ans.price || "").match(/(\d+[.,]\d+|\d+)/)?.[0]?.replace(",", ".") || 0);
  const firstPack = String(ans.pack || "").split("/")[0].trim(); const kgPack = Number(firstPack.match(/(\d+)\s*kg/i)?.[1] || 0);
  const line: OrderLine = kind === "sample" ? { code: ans.code || "", product: ans.grade || "", pack: "sample", qty: 1, kg: 1 } : { code: ans.code || "", product: ans.grade || "", pack: firstPack, qty: 1, kg: kgPack, price: firstPrice || undefined };
  const id = (await sb.rpc("next_order_id", { k: kind })).data as string | null; if (!id) throw new Error("numbering failed");
  const now = new Date().toISOString();
  let o = { id, kind, project_id: prj?.id || null, lead_id: leadId, lead_name: (lead?.name as string) || (prj?.lead_name as string) || "", stage: "draft", lines: [line],
    customer: { company: lead?.name || "", contact: lead?.contact_name || "", role: lead?.contact_role || "", email: lead?.contact_email || "", phone: lead?.contact_phone || "", address: [lead?.address, lead?.city].filter(Boolean).join(", ") },
    shipping: { consignee: "Avshalom Sapir - Sapirim", courier: "DHL / FedEx" }, bank: { currency: "EUR" }, incoterm: "EXW Cologna Veneta (VR), Italy", files: [],
    history: [{ at: now, text: "📝 נפתחה " + (kind === "product" ? "הזמנת מוצר" : "הזמנת דוגמה") + (prj ? " · #" + prj.id : "") + (b.note ? " · " + b.note : "") }], created_at: now, updated_at: now } as unknown as Order;
  if (b.parsed) o = { ...o, ...applyParsed(o, b.parsed) };
  const r = await sb.from("orders").insert(o).select("*").single(); if (r.error) throw new Error(r.error.message);
  await sb.from("activities").insert({ id: "act-ord-" + id + "-" + Date.now().toString(36), lead_id: leadId, at: now, kind: "order", text: "📦 " + id + " נפתחה" + (prj ? " · #" + prj.id : "") + (b.note ? " · " + b.note : "") });
  return r.data as Order;
}

const blank = (l: OrderLine) => !l.product && !l.code;
/** AI-read fields → patch: lines replace an empty / single default line; customer + delivery fields fill only what is empty */
export function applyParsed(o: Order, p: Parsed): Partial<Order> {
  const out: Partial<Order> = {};
  const got = (p.lines || []).filter((l) => l.product || l.code).map((l) => ({ code: String(l.code || ""), product: String(l.product || ""), pack: String(l.pack || (o.kind === "sample" ? "sample" : "")), qty: Number(l.qty) || 1, kg: Number(l.kg) || (o.kind === "sample" ? 1 : 0), ...(l.price ? { price: Number(l.price) } : {}) }));
  if (got.length && (o.lines.length === 0 || o.lines.every(blank) || o.lines.length === 1)) {
    // keep the Silitex code / price on a line the customer named by the same product
    const base = o.lines[0]; out.lines = got.map((g) => (base && !blank(base) && (g.product.toLowerCase().includes(base.product.toLowerCase().slice(0, 8)) || g.code === base.code) ? { ...base, ...g, code: g.code || base.code, price: g.price ?? base.price } : g));
  }
  const c = { ...o.customer }; if (p.contact && !c.contact) c.contact = p.contact; if (p.phone && !c.phone) c.phone = p.phone; if (p.email && !c.email) c.email = p.email; out.customer = c;
  if (p.delivery_address && !o.shipping?.address) out.shipping = { ...o.shipping, address: p.delivery_address };
  if (p.customer_po && !o.customer_po) out.customer_po = p.customer_po;
  if (p.notes) out.shipping = { ...(out.shipping || o.shipping), notes: [o.shipping?.notes, p.notes].filter(Boolean).join(" · ").slice(0, 300) };
  return out;
}
