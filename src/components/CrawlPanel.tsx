"use client";
// CrawlPanel.tsx (src/components/CrawlPanel.tsx) · updated 09.10.2026 10:30 (Asia/Jerusalem) — crawl silitex.it categories into the KB (client-side loop, one category per request)
import { useEffect, useState } from "react";
import { btnPrimary, btnGhost, inputCls } from "./ui";
import { uid } from "@/lib/format";
import type { KbDoc, KbChunk } from "@/lib/types";
import { useLang } from "@/i18n";
type Props = { existingTitles: string[]; onDoc: (doc: KbDoc, chunks: KbChunk[]) => void };
export default function CrawlPanel({ existingTitles, onDoc }: Props) {
  const { t: tr } = useLang();
  const [cats, setCats] = useState<string[]>([]); const [sel, setSel] = useState<string[]>([]); const [busy, setBusy] = useState(false); const [log, setLog] = useState<string[]>([]);
  useEffect(() => { fetch("/api/rag/crawl").then((r) => r.json()).then((j) => setCats(j.categories || [])); }, []);
  const toggle = (c: string) => setSel((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  const run = async () => {
    setBusy(true); setLog([]);
    for (const c of sel) {
      try {
        const r = await fetch("/api/rag/crawl", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: c }) }); const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        let n = 0;
        for (const d of j.docs) {
          if (existingTitles.includes(d.title)) continue;
          const id = uid("doc");
          onDoc({ id, title: d.title, doc_type: "SALES", product_ref: d.product_ref, created_at: new Date().toISOString(), chunks: d.chunks.length }, (d.chunks as string[]).map((text) => ({ id: uid("chk"), doc_id: id, title: d.title, doc_type: "SALES", product_ref: d.product_ref, text })));
          n++;
        }
        setLog((l) => [...l, "✓ " + c + ": " + n + tr(" דפים") + (j.errors.length ? " · " + j.errors.length + tr(" שגיאות") : "")]);
      } catch (e: unknown) { setLog((l) => [...l, "✗ " + c + ": " + (e instanceof Error ? e.message : "fail")]); }
    }
    setBusy(false);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between"><h3 className="font-bold">{tr("סריקת silitex.it → מאגר ידע")}</h3><div className="flex gap-2"><button className={btnGhost} onClick={() => setSel(cats)}>{tr("הכל")}</button><button className={btnGhost} onClick={() => setSel([])}>{tr("נקה")}</button><button className={btnPrimary} disabled={busy || !sel.length} onClick={run}>{busy ? tr("סורק…") : tr("סרוק ") + sel.length + tr(" קטגוריות")}</button></div></div>
      <div className="flex flex-wrap gap-1 max-h-40 overflow-auto">{cats.map((c) => (<button key={c} onClick={() => toggle(c)} className={"text-xs px-2 py-1 rounded-full border " + (sel.includes(c) ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{c}</button>))}</div>
      {log.length > 0 && <pre className={inputCls + " text-xs whitespace-pre-wrap"}>{log.join("\n")}</pre>}
      <details className="text-xs text-slate-500"><summary className="cursor-pointer">⚙</summary>{tr("הבוט השבועי (vercel.json, יום א' 04:30) סורק את כל הקטגוריות ישירות ל-Supabase כשמוגדר SUPABASE_SERVICE_ROLE_KEY.")}</details>
    </div>
  );
}
