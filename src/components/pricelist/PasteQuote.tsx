"use client";
// PasteQuote.tsx (src/components/pricelist/PasteQuote.tsx) · created 13.11.2026 13:50 (Asia/Jerusalem) — v1.11.0 📥 Silitex quote → price list: pick a Silitex price mail from the Hub (or paste any quote) → Claude extracts product × pack × €/kg → review (✓ catalogue match / ⚠ new name) → apply. Same pack label = price updated (old price kept in history). Meter + export bar.
import { useEffect, useState } from "react";
import { Card, Badge, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import { keyOf, eur, type ListRow, type PriceRow } from "@/lib/pricelist";
import { fmtDate, todayIso } from "@/lib/format";
import type { Usage } from "@/lib/types";
import { useLang } from "@/i18n";

type Line = { product: string; code: string; pack_label: string; kg: number; eur_kg: number; incoterm: string; countertype: string; inci: string; cas: string; note: string; on?: boolean };
type Mail = { id: string; at: string; from: string; subject: string; body: string };
export default function PasteQuote({ all, onApply }: { all: ListRow[]; onApply: (rows: Partial<PriceRow>[]) => Promise<boolean> }) {
  const { t: tr } = useLang();
  const [mails, setMails] = useState<Mail[]>([]); const [text, setText] = useState(""); const [at, setAt] = useState(todayIso()); const [src, setSrc] = useState("");
  const [lines, setLines] = useState<Line[]>([]); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null); const [sess, setSess] = useState({ t: 0, c: 0 });
  useEffect(() => { fetch("/api/pricelist/parse").then((r) => r.json()).then((j) => setMails(j.mails || [])).catch(() => {}); }, []);
  const byKey = new Map(all.map((r) => [keyOf(r.product), r]));
  const pick = (m: Mail) => { setText(m.body); setAt(m.at.slice(0, 10)); setSrc(m.from.split(" - ")[0] + " " + fmtDate(m.at)); setLines([]); };
  const read = async () => {
    setBusy(true); setErr(""); setLines([]);
    try {
      const r = await fetch("/api/pricelist/parse", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, at }) }); const j = await r.json();
      if (!r.ok) throw new Error(j.error || "failed");
      setUsage(j.usage); if (j.usage) setSess((s) => ({ t: s.t + j.usage.input_tokens + j.usage.output_tokens, c: s.c + j.usage.cost_usd }));
      const ls = ((j.lines || []) as Line[]).map((l) => ({ ...l, on: l.eur_kg > 0 })); setLines(ls); if (!ls.length) setErr(tr("לא נמצאו שורות מחיר בטקסט"));
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "error"); }
    setBusy(false);
  };
  const apply = async () => {
    const rows = new Map<string, Partial<PriceRow>>();
    for (const l of lines.filter((x) => x.on && x.product && x.eur_kg > 0)) {
      const k = keyOf(l.product); const cur = byKey.get(k); const prev = rows.get(k);
      const base: Partial<PriceRow> = prev || { product: cur?.product || l.product, code: l.code || cur?.code || "", inci: cur?.inci || l.inci || "", cas: cur?.cas || l.cas || "", countertype: l.countertype || cur?.countertype || "", notes: cur?.inDb ? cur.notes : l.note, packs: [...(cur?.inDb ? cur.packs : [])], sector: cur?.inDb ? cur.sector : "" };
      const pack = { label: l.pack_label || l.kg + " kg", kg: l.kg, eur_kg: l.eur_kg, incoterm: l.incoterm, quoted_at: at, source: src || tr("הצעת מחיר ") + fmtDate(at) };
      const packs = (base.packs || []).filter((p) => p.label.toLowerCase() !== pack.label.toLowerCase()); packs.push(pack);
      rows.set(k, { ...base, packs });
    }
    if (rows.size) await onApply(Array.from(rows.values()));
  };
  const setL = (i: number, patch: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const out = lines.map((l) => l.product + (l.code ? " [" + l.code + "]" : "") + " — " + l.pack_label + " " + eur(l.eur_kg) + "/kg " + l.incoterm + (l.countertype ? " · ≈ " + l.countertype : "")).join("\n");
  return (
    <Card className="space-y-3 border-brand-300">
      <div className="font-bold">{tr("📥 קליטת הצעת מחיר מ-Silitex")}</div>
      {mails.length > 0 && <div><div className="text-xs text-slate-500 mb-1">{tr("מיילים אחרונים מ-Silitex עם מחיר (Hub) — לחיצה טוענת:")}</div><div className="flex flex-wrap gap-1.5">{mails.map((m) => <button key={m.id} onClick={() => pick(m)} className="text-start text-xs border rounded-lg px-2 py-1 bg-white hover:border-brand-500 max-w-[320px]" title={m.subject}><b>{fmtDate(m.at)}</b> · {m.from.split(" - ")[0]}<div className="truncate text-slate-500">{m.subject}</div></button>)}</div></div>}
      <textarea className={inputCls} rows={6} dir="ltr" placeholder={tr("או הדבק כאן כל הצעת מחיר / מייל / טבלה…")} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex flex-wrap gap-2 items-center"><label className="text-xs">{tr("תאריך ההצעה ")}<input type="date" className={inputCls + " inline-block w-40"} value={at} onChange={(e) => setAt(e.target.value)} /></label><input className={inputCls + " w-56"} placeholder={tr("מקור (Eleonora…)")} value={src} onChange={(e) => setSrc(e.target.value)} /><button className={btnPrimary} disabled={busy || text.trim().length < 20} onClick={read}>{busy ? tr("קורא…") : tr("✨ קריאת מחירים")}</button></div>
      <TokenMeter usage={usage} sessionTokens={sess.t} sessionCost={sess.c} busy={busy} />
      {err && <div className="text-sm text-red-600">{err}</div>}
      {lines.length > 0 && (
        <div className="space-y-2">
          <table className="w-full text-sm"><thead className="text-xs text-slate-500"><tr><th></th><th className="text-start">{tr("מוצר")}</th><th className="text-start">{tr("אריזה")}</th><th>€/kg</th><th>Incoterm</th><th className="text-start">{tr("התאמה")}</th></tr></thead>
            <tbody>{lines.map((l, i) => { const hit = byKey.get(keyOf(l.product)); const old = hit?.packs.find((p) => p.label.toLowerCase() === (l.pack_label || "").toLowerCase()); return (
              <tr key={i} className="border-t"><td><input type="checkbox" checked={!!l.on} onChange={(e) => setL(i, { on: e.target.checked })} /></td><td><input className={inputCls} dir="ltr" value={l.product} onChange={(e) => setL(i, { product: e.target.value })} /><div className="text-[11px] text-slate-500">{l.code}{l.countertype ? " · ≈ " + l.countertype : ""}</div></td><td><input className={inputCls} dir="ltr" value={l.pack_label} onChange={(e) => setL(i, { pack_label: e.target.value })} /></td><td><input className={inputCls + " w-24 font-bold"} type="number" step="0.01" dir="ltr" value={l.eur_kg} onChange={(e) => setL(i, { eur_kg: Number(e.target.value) })} /></td><td className="text-center text-xs">{l.incoterm}</td><td className="text-xs">{hit?.inCatalog ? <Badge tone="green">{tr("✓ בקטלוג")}</Badge> : hit ? <Badge tone="blue">{tr("קיים במחירון")}</Badge> : <Badge tone="amber">{tr("⚠ שם חדש")}</Badge>}{old && <div className="text-slate-500">{tr("היה ")}{eur(old.eur_kg)} → {eur(l.eur_kg)}</div>}</td></tr>); })}</tbody>
          </table>
          <div className="flex gap-2"><button className={btnPrimary} onClick={apply}>{tr("💾 עדכון המחירון (")}{lines.filter((l) => l.on).length})</button><button className={btnGhost} onClick={() => setLines([])}>{tr("ניקוי")}</button></div>
          <ExportBar title={tr("הצעת מחיר Silitex ") + fmtDate(at)} text={out} />
        </div>
      )}
    </Card>
  );
}
