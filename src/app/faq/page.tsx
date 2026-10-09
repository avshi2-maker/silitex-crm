"use client";
// page.tsx (src/app/faq/page.tsx) · updated 09.10.2026 13:20 (Asia/Jerusalem) — 50 Q&A built from silitex.it + catalog assets (src/data/faq.json). Filter by category / text.
import { useMemo, useState } from "react";
import faq from "@/data/faq.json";
import { Card, H1, Badge, inputCls } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import { useLang } from "@/i18n";
type Item = { n: number; cat: string; q: string; a: string; src: string };
const DATA = faq as { built: string; sources: string[]; items: Item[] };
export default function FaqPage() {
  const { t: tr } = useLang();
  const [q, setQ] = useState(""); const [cat, setCat] = useState(""); const [open, setOpen] = useState<number | null>(null);
  const cats = Array.from(new Set(DATA.items.map((i) => i.cat)));
  const list = useMemo(() => DATA.items.filter((i) => (!cat || i.cat === cat) && (!q || (i.q + i.a).toLowerCase().includes(q.toLowerCase()))), [q, cat]);
  const text = list.map((i) => i.n + ". " + i.q + "\n" + i.a + "\n(" + i.src + ")").join("\n\n");
  return (
    <div className="space-y-4">
      <H1 sub={tr("50 שאלות ותשובות מתוך silitex.it והקטלוג — שקיפות מלאה, עם מקור לכל תשובה · ") + DATA.built}>{tr("Silitex — 50 שאלות ותשובות")}</H1>
      <Card className="flex flex-wrap gap-2 items-center">
        <input className={inputCls + " flex-1 min-w-[240px]"} placeholder={tr("חיפוש בשאלות ובתשובות…")} value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={() => setCat("")} className={"text-xs px-2 py-1 rounded-full border " + (!cat ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{tr("הכל")} ({DATA.items.length})</button>
        {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={"text-xs px-2 py-1 rounded-full border " + (cat === c ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{c} ({DATA.items.filter((i) => i.cat === c).length})</button>)}
      </Card>
      <div className="space-y-2">
        {list.map((i) => (
          <Card key={i.n} className="p-0 overflow-hidden">
            <button className="w-full text-start p-4 flex gap-3 items-start hover:bg-slate-50" onClick={() => setOpen(open === i.n ? null : i.n)}>
              <span className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center shrink-0">{i.n}</span>
              <span className="font-medium flex-1">{i.q}</span><Badge>{i.cat}</Badge><span className="text-slate-400">{open === i.n ? "−" : "+"}</span>
            </button>
            {open === i.n && <div className="px-4 pb-4 ps-14 text-sm text-slate-700 leading-6">{i.a}<div className="text-xs text-slate-400 mt-2">{tr("מקור")}: {i.src}</div></div>}
          </Card>
        ))}
      </div>
      <ExportBar title="Silitex — 50 Q&A" text={text} />
    </div>
  );
}
