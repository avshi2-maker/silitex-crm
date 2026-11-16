"use client";
// use-orders.ts (src/lib/use-orders.ts) · created 16.11.2026 17:20 (Asia/Jerusalem) — v1.13.0 📦 Orders — client hook over /api/orders + direct phone → Cloudinary upload of a signed copy / proforma / SWIFT (standing mobile flow: no long request)
import { useCallback, useEffect, useState } from "react";
import { emitSave } from "./save-signal";
import type { Order } from "./types";

/** no arg = all orders · { id } = one · { project } = that project's orders */
export function useOrders(by?: { id?: string; project?: string }) {
  const qs = by?.id ? "?id=" + encodeURIComponent(by.id) : by?.project ? "?project=" + encodeURIComponent(by.project) : "";
  const [list, setList] = useState<Order[] | null>(null); const [err, setErr] = useState("");
  const reload = useCallback(() => { fetch("/api/orders" + qs, { cache: "no-store" }).then((r) => r.json()).then((j) => { setList((j.orders || []) as Order[]); setErr(j.error || ""); }).catch((e) => { setList([]); setErr(String(e)); }); }, [qs]);
  useEffect(() => { reload(); }, [reload]);
  const create = async (b: { kind: "sample" | "product"; project_id?: string; lead_id?: string }) => {
    const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); const j = await r.json();
    if (!r.ok) { emitSave("err", j.error); throw new Error(j.error || "error"); } emitSave("ok"); reload(); return j.order as Order;
  };
  const patch = async (id: string, p: Partial<Order>, note?: string) => {
    const r = await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, patch: p, note }) }); const j = await r.json();
    if (!r.ok) { emitSave("err", j.error); throw new Error(j.error || "error"); } emitSave("ok");
    setList((cur) => (cur || []).map((x) => (x.id === id ? (j.order as Order) : x))); return j.order as Order;
  };
  return { list, err, reload, create, patch };
}
/** phone / PC → Cloudinary direct (signed by /api/projects/sign), returns the file url — nothing passes through our server */
export async function uploadOrderFile(orderId: string, file: File): Promise<string> {
  const s = await fetch("/api/projects/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: orderId, kind: "doc" }) });
  const p = await s.json(); if (!s.ok) throw new Error(p.error || "sign " + s.status);
  const fd = new FormData(); fd.append("file", file, file.name);
  for (const k of ["api_key", "timestamp", "signature", "folder", "tags"]) fd.append(k, String(p[k]));
  const up = await fetch("https://api.cloudinary.com/v1_1/" + p.cloud + "/auto/upload", { method: "POST", body: fd });
  const u = await up.json(); if (!up.ok || !u.secure_url) throw new Error(u?.error?.message || "upload " + up.status); return u.secure_url as string;
}
