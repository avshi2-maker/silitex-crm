// route.ts (src/app/api/capture/inbox/route.ts) · updated 18.10.2026 07:00 (Asia/Jerusalem) — exact config error · owner only: GET → field uploads not yet processed, grouped by meeting; quick text notes (raw .txt) are read inline
import { NextResponse } from "next/server";
import { searchInbox, cfgError, type Asset } from "@/lib/cloudinary";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export type InboxItem = Asset & { kind: string; text?: string };
export type InboxGroup = { meeting: string; label: string; lead: string; first: string; items: InboxItem[] };
export async function GET() {
  try {
    const res = await searchInbox(); if (!res) return NextResponse.json({ error: cfgError() }, { status: 503 });
    const groups = new Map<string, InboxGroup>();
    for (const a of res) {
      const ctx = a.context || {}; const m = ctx.meeting || (a.tags.find((t) => t.startsWith("fm-")) || "fm-unsorted").slice(3);
      const kind = ctx.kind || (a.tags.find((t) => t.startsWith("k-")) || "k-photo").slice(2);
      const item: InboxItem = { ...a, kind };
      if (a.resource_type === "raw") { try { item.text = (await (await fetch(a.secure_url, { cache: "no-store" })).text()).slice(0, 4000); } catch {} }
      const g = groups.get(m) || { meeting: m, label: ctx.label || "", lead: ctx.lead || "", first: a.created_at, items: [] };
      if (!g.label && ctx.label) g.label = ctx.label; if (!g.lead && ctx.lead) g.lead = ctx.lead;
      g.items.push(item); groups.set(m, g);
    }
    return NextResponse.json({ groups: Array.from(groups.values()).sort((a, b) => b.first.localeCompare(a.first)) });
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 500 }); }
}
