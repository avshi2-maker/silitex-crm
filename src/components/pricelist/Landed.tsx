"use client";
// Landed.tsx (src/components/pricelist/Landed.tsx) · created 13.11.2026 13:45 (Asia/Jerusalem) — v1.11.0 🚢 landed cost in Israel: EXW €/kg + freight % + duty % → cost; + margin % → selling price (€ and ₪). Settings remembered in this browser.
import { useEffect, useState } from "react";
import { inputCls } from "@/components/ui";
import { landed, LANDED_DEFAULT, eur, ils, type Landed as L } from "@/lib/pricelist";
import { useLang } from "@/i18n";
const KEY = "silitex-landed-v1";
export default function Landed({ eurKg }: { eurKg: number }) {
  const { t: tr } = useLang();
  const [l, setL] = useState<L>(LANDED_DEFAULT);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); if (v) setL({ ...LANDED_DEFAULT, ...v }); } catch {} }, []);
  const set = (k: keyof L, v: number) => setL((o) => { const n = { ...o, [k]: v }; try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} return n; });
  const x = landed(eurKg, l);
  const f = (k: keyof L, label: string, step = 1) => <label className="text-xs"><span className="text-slate-500 block">{label}</span><input className={inputCls} type="number" step={step} dir="ltr" value={l[k]} onChange={(e) => set(k, Number(e.target.value))} /></label>;
  return (
    <div className="border rounded-xl p-3 bg-slate-50 space-y-2">
      <div className="font-medium text-sm">{tr("🚢 עלות נחיתה בישראל ומחיר מכירה (לפי המחיר הזול: ")}{eur(eurKg)}/kg)</div>
      <div className="grid grid-cols-4 gap-2">{f("freight", tr("הובלה %"))}{f("duty", tr("מכס %"))}{f("margin", tr("מרווח %"))}{f("rate", "€→₪", 0.01)}</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-white rounded-lg p-2 border"><div className="text-xs text-slate-500">{tr("עלות נחיתה / ק״ג")}</div><b dir="ltr">{eur(x.cost)}</b> · <span dir="ltr">{ils(x.costIls)}</span></div>
        <div className="bg-white rounded-lg p-2 border border-brand-300"><div className="text-xs text-slate-500">{tr("מחיר מכירה מוצע / ק״ג")}</div><b dir="ltr">{eur(x.sell)}</b> · <span dir="ltr">{ils(x.sellIls)}</span></div>
      </div>
      <div className="text-[11px] text-slate-500">{tr("הערכה בלבד — הובלה מאיטליה למשטח 1 טון היא בערך 15–25% מערך מוצר זול. לעדכן לפי הצעת המשלח.")}</div>
    </div>
  );
}
