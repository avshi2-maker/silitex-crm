"use client";
// page.tsx (src/app/kb/page.tsx) · updated 09.10.2026 10:05 (Asia/Jerusalem) — knowledge base: upload TDS / MSDS / sales specs → ask questions (RAG)
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/data";
import { scoreChunks } from "@/lib/rag";
import { Card, H1, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import CrawlPanel from "@/components/CrawlPanel";
import { fmtDate, uid } from "@/lib/format";
import { ragContext, ragPrompt } from "@/prompts/rag";
import type { KbDoc, KbChunk } from "@/lib/types";
export default function KbPage() {
  const { state, ready, addKbDoc, removeKbDoc, addSpend } = useStore();
  const [file, setFile] = useState<File | null>(null); const [type, setType] = useState<KbDoc["doc_type"]>("TDS"); const [prod, setProd] = useState(""); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const [q, setQ] = useState(""); const [hits, setHits] = useState<KbChunk[]>([]);
  if (!ready) return null;
  const ingest = async () => {
    if (!file) return; setBusy(true); setMsg("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/rag/extract", { method: "POST", body: fd }); const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      const doc: KbDoc = { id: uid("doc"), title: file.name, doc_type: type, product_ref: prod, created_at: new Date().toISOString(), chunks: j.chunks.length };
      addKbDoc(doc, (j.chunks as string[]).map((text) => ({ id: uid("chk"), doc_id: doc.id, title: doc.title, doc_type: type, product_ref: prod, text })));
      setMsg("נקלט: " + file.name + " · " + j.chars.toLocaleString() + " תווים · " + j.chunks.length + " מקטעים"); setFile(null);
    } catch (e: unknown) { setMsg("שגיאה: " + (e instanceof Error ? e.message : "")); }
    setBusy(false);
  };
  const search = () => setHits(scoreChunks(q, state.kbChunks));
  return (
    <div className="space-y-4">
      <H1 sub="דפי נתונים (TDS), גיליונות בטיחות (MSDS) ומפרטי מכירה → שאלות ותשובות מבוססות מסמכים">מאגר ידע — RAG</H1>
      <Card className="grid md:grid-cols-4 gap-2 items-end">
        <label className="text-xs text-slate-500 md:col-span-2">קובץ PDF / TXT / MD<input type="file" accept=".pdf,.txt,.md" className={inputCls + " mt-1"} onChange={(e) => setFile(e.target.files?.[0] || null)} /></label>
        <label className="text-xs text-slate-500">סוג<select className={inputCls + " mt-1"} value={type} onChange={(e) => setType(e.target.value as KbDoc["doc_type"])}><option value="TDS">TDS — דף נתונים</option><option value="MSDS">MSDS — בטיחות</option><option value="SALES">מפרט מכירה</option><option value="OTHER">אחר</option></select></label>
        <label className="text-xs text-slate-500">מוצר<select className={inputCls + " mt-1"} value={prod} onChange={(e) => setProd(e.target.value)}><option value="">— כללי —</option>{PRODUCTS.map((p) => <option key={p.id} value={p.product_name}>{p.product_name}</option>)}</select></label>
        <button className={btnPrimary + " md:col-span-4"} disabled={!file || busy} onClick={ingest}>{busy ? "מחלץ טקסט…" : "📥 קלוט למאגר"}</button>
        {msg && <div className="text-sm md:col-span-4">{msg}</div>}
      </Card>
      <Card><CrawlPanel existingTitles={state.kbDocs.map((d) => d.title)} onDoc={addKbDoc} /></Card>
      <Card>
        <h3 className="font-bold mb-2">מסמכים ({state.kbDocs.length}) · {state.kbChunks.length} מקטעים</h3>
        {state.kbDocs.length === 0 && <p className="text-sm text-slate-400">אין מסמכים. העלה TDS / MSDS של Silitex.</p>}
        <ul className="text-sm space-y-1">{state.kbDocs.map((d) => (<li key={d.id} className="flex items-center gap-2"><Badge tone={d.doc_type === "MSDS" ? "red" : d.doc_type === "TDS" ? "blue" : "slate"}>{d.doc_type}</Badge><span className="font-medium">{d.title}</span><span className="text-slate-400">{d.product_ref} · {d.chunks} מקטעים · {fmtDate(d.created_at)}</span><button className="text-xs text-red-500 mr-auto" onClick={() => { if (confirm("להסיר את " + d.title + "?")) removeKbDoc(d.id); }}>הסר</button></li>))}</ul>
      </Card>
      <Card className="space-y-3">
        <div className="flex gap-2"><input className={inputCls} placeholder="שאלה: למשל 'מה המינון המומלץ של SILIFOOD 1600 בשטיפת פירות?'" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} /><button className={btnGhost} onClick={search}>🔎 אחזר</button></div>
        {hits.length > 0 && <div className="text-xs text-slate-500">{hits.length} מקטעים רלוונטיים: {Array.from(new Set(hits.map((h) => h.title))).join(" · ")}</div>}
        <AiPanel title={"תשובה ממסמכי Silitex"} buttonLabel="ענה עם Claude (RAG)" sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)}
          buildPrompt={() => { const h = hits.length ? hits : scoreChunks(q, state.kbChunks); return { context: ragContext(h), prompt: ragPrompt(q) }; }} />
      </Card>
    </div>
  );
}
