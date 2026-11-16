// route.ts (src/app/api/orders/route.ts) · updated 16.11.2026 18:45 (Asia/Jerusalem) — v1.14.0 create via lib/orders-server · created 16.11.2026 17:15 — v1.13.0 📦 Orders (behind the PIN gate)
// GET → all orders (newest first) · ?id=ORD-S-0001 → one · ?project=SPR-0001 → that project's orders
// POST {kind, project_id?, lead_id?} → new order with its own number (ORD-S / ORD-P from DB sequences), pre-filled from the project's
//      Silitex answer (grade, price, pack) and the customer card (company, contact, e-mail, phone, address)
// PATCH {id, patch, note?} → field whitelist; a stage change writes history + customer activity; stage "pay" → 🏦 bank task in My day;
//      a sample order cannot move to "sent to Silitex" before the customer's signed copy is back.
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { createOrder } from "@/lib/orders-server";
import { fmtDate, todayIso } from "@/lib/format";
import { orderStage, stageNo } from "@/config/orders";
import { fmtEur, orderTotal } from "@/lib/orders";
import type { Order } from "@/lib/types";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const FIELDS = ["stage", "lines", "customer", "customer_po", "incoterm", "payment_terms", "shipping", "bank", "silitex_ref", "tracking", "files", "notes"] as const;

export async function GET(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ orders: [], note: "no supabase" });
  const sp = new URL(req.url).searchParams; let q = sb.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
  if (sp.get("id")) q = q.eq("id", sp.get("id")!); else if (sp.get("project")) q = q.eq("project_id", sp.get("project")!);
  const r = await q; if (r.error) return NextResponse.json({ orders: [], error: r.error.message }, { status: 500 });
  return NextResponse.json({ orders: r.data || [] });
}

export async function POST(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  const b = (await req.json().catch(() => ({}))) as { kind?: string; project_id?: string; lead_id?: string };
  const kind = b.kind === "product" ? "product" : "sample";
  try { return NextResponse.json({ order: await createOrder(sb, { kind, project_id: b.project_id, lead_id: b.lead_id }) }); }
  catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "create failed" }, { status: 400 }); }
}

export async function PATCH(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  const b = (await req.json().catch(() => ({}))) as { id?: string; patch?: Partial<Order>; note?: string };
  const cur = (await sb.from("orders").select("*").eq("id", b.id || "").maybeSingle()).data as Order | null; if (!cur) return NextResponse.json({ error: "not found" }, { status: 404 });
  const patch: Record<string, unknown> = {}; for (const k of FIELDS) if (b.patch && k in b.patch) patch[k] = (b.patch as Record<string, unknown>)[k];
  const next = String(patch.stage || cur.stage);
  const files = (patch.files as Order["files"] | undefined) || cur.files || [];
  if (patch.stage && cur.kind === "sample" && stageNo(cur.kind, next) >= stageNo(cur.kind, "silitex_sent") && !files.some((f) => f.kind === "signed"))
    return NextResponse.json({ error: "קודם צריך את הטופס החתום של הלקוח" }, { status: 409 });
  const now = new Date().toISOString(); const history = [...(cur.history || [])];
  if (patch.stage && patch.stage !== cur.stage) history.push({ at: now, text: orderStage(cur.kind, next).icon + " " + orderStage(cur.kind, next).he });
  if (b.note?.trim()) history.push({ at: now, text: b.note.trim() });
  const r = await sb.from("orders").update({ ...patch, history, updated_at: now }).eq("id", cur.id).select("*").single();
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });
  const o = r.data as Order;
  if (patch.stage && patch.stage !== cur.stage) {
    await sb.from("activities").insert({ id: "act-ord-" + o.id + "-" + Date.now().toString(36), lead_id: o.lead_id, at: now, kind: "order", text: "📦 " + o.id + " — " + orderStage(o.kind, o.stage).he });
    if (o.stage === "pay") { // 🏦 a real task in My day: instruct the bank (Hebrew text is on the order card)
      const amt = o.bank?.amount || (orderTotal(o) ? fmtEur(orderTotal(o)) : "[סכום]");
      await sb.from("tasks").upsert({ id: "task-ord-" + o.id + "-bank", lead_id: o.lead_id, lead_name: o.lead_name, title: "🏦 להורות לבנק: העברה " + amt + " " + (o.bank?.currency || "EUR") + " ל-Silitex · " + o.id + " (הטקסט לבנק בכרטיס ההזמנה)", due: todayIso(), cadence: "once", done: false, kind: "order" });
    }
    if (["paid", "closed"].includes(o.stage)) await sb.from("tasks").update({ done: true }).eq("id", "task-ord-" + o.id + "-bank");
  }
  if (b.note?.trim()) await sb.from("activities").insert({ id: "act-ord-" + o.id + "-n" + Date.now().toString(36), lead_id: o.lead_id, at: now, kind: "order", text: "📦 " + o.id + " · " + fmtDate(now) + " — " + b.note.trim() });
  return NextResponse.json({ order: o });
}
