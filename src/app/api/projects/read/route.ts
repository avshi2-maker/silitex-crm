// route.ts (src/app/api/projects/read/route.ts) · created 10.11.2026 13:45 (Asia/Jerusalem) — v1.10.0 📷 read a PO / invoice / quote from its Cloudinary photo or PDF
// POST {id, kind, url, name} → Claude vision (page 1 as JPG) → {number, date, total, currency, lines, customer} + the file is saved on the project (files[]).
// Nothing is written into the PO / invoice fields here — the card fills the boxes and YOU press שמור (that is what bumps the version).
import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server-data";
import { askImageUrl } from "@/lib/ai";
import type { Project, ProjectFile } from "@/lib/types";
export const runtime = "nodejs"; export const maxDuration = 60;
const LABEL: Record<string, string> = { quote_ref: "price quotation", po_sample: "purchase order (sample)", po_product: "purchase order", invoice: "tax invoice (Israeli חשבונית מס)", doc: "business document" };
const PROMPT = (k: string) => `This image is a ${LABEL[k] || LABEL.doc}. Reply with ONE line of JSON only:
{"number":"","date":"YYYY-MM-DD","customer":"","total":"","currency":"","lines":"","notes":""}
number = the document's own number (PO no. / invoice no. / quote no.). lines = items as "product · qty · unit price" separated by "; ". Copy exactly, Hebrew stays Hebrew. Empty string when not visible. Never invent.`;
const jpg = (u: string) => u.replace("/upload/", "/upload/pg_1,c_limit,w_1800,q_auto,f_jpg/").replace(/\.(pdf|png|webp|heic|jpe?g)$/i, ".jpg");
export async function POST(req: Request) {
  const sb = serviceClient(); if (!sb) return NextResponse.json({ error: "no supabase" }, { status: 500 });
  const b = (await req.json()) as { id: string; kind: string; url: string; name?: string };
  if (!b.id || !/^https:\/\/res\.cloudinary\.com\//.test(b.url || "")) return NextResponse.json({ error: "id + cloudinary url required" }, { status: 400 });
  const p = (await sb.from("projects").select("id,files").eq("id", b.id).maybeSingle()).data as Pick<Project, "id" | "files"> | null; if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const { text, usage } = await askImageUrl(PROMPT(b.kind), jpg(b.url), 600);
    let data: Record<string, string> = {}; try { data = JSON.parse(/\{[\s\S]*\}/.exec(text)?.[0] || "{}"); } catch { /* keep empty */ }
    const f: ProjectFile = { kind: b.kind, url: b.url, name: (b.name || "file").slice(0, 120), at: new Date().toISOString(), text: Object.entries(data).filter(([, v]) => v).map(([k, v]) => k + ": " + v).join("\n") };
    await sb.from("projects").update({ files: [...(p.files || []), f] }).eq("id", b.id);
    return NextResponse.json({ data, file: f, usage });
  } catch (e: unknown) { return NextResponse.json({ error: e instanceof Error ? e.message : "read failed" }, { status: 500 }); }
}
