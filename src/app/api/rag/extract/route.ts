// route.ts (src/app/api/rag/extract/route.ts) · updated 09.10.2026 09:10 (Asia/Jerusalem)
// Accepts PDF / TXT / MD upload → returns plain text + chunks. Retrieval itself is keyword-scored client side (lib/rag.ts) — no embedding service needed for the mockup.
import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { chunkText } from "@/lib/rag";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
    const buf = new Uint8Array(await file.arrayBuffer());
    let text = "";
    if (/\.pdf$/i.test(file.name)) {
      const pdf = await getDocumentProxy(buf);
      const r = await extractText(pdf, { mergePages: true });
      text = typeof r.text === "string" ? r.text : (r.text as string[]).join("\n");
    } else {
      text = new TextDecoder("utf-8").decode(buf);
    }
    text = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    return NextResponse.json({ name: file.name, chars: text.length, chunks: chunkText(text) });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "extract error" }, { status: 500 });
  }
}
