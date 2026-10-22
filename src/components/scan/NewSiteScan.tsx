"use client";
// NewSiteScan.tsx (src/components/scan/NewSiteScan.tsx) · updated 22.10.2026 16:55 (Asia/Jerusalem) — new site saved as "לסיווג" → the scan sets the industry by itself; pick-list = CRM industries · created 22.10.2026 16:35 (Asia/Jerusalem) — ➕ paste a website you just found (no other data yet) → industry (optional) → "add + scan": creates a Tier 3 prospect named from the domain (rename later) and scans it at once. Same site already in the CRM → says so and rescans that customer instead of creating a duplicate.
import { useState } from "react";
import Link from "next/link";
import { inputCls, btnPrimary } from "@/components/ui";
import { uid } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Lead } from "@/lib/types";
import { industryOptions, UNCLASSIFIED } from "@/config/industry-list";
const host = (u?: string) => { try { return new URL(/^https?:\/\//i.test(u || "") ? String(u) : "https://" + u).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; } };
const nameOf = (h: string) => { const b = h.split(".")[0] || h; return b.charAt(0).toUpperCase() + b.slice(1); };
type Props = { leads: Lead[]; inds: string[]; busy: boolean; onAdd: (l: Lead) => void; onScan: (l: Lead) => Promise<void> };
export default function NewSiteScan({ leads, inds, busy, onAdd, onScan }: Props) {
  const { t: tr } = useLang();
  const [url, setUrl] = useState(""); const [ind, setInd] = useState(""); const [name, setName] = useState(""); const [msg, setMsg] = useState<{ text: string; id?: string } | null>(null);
  const h = host(url.trim()); const dup = h ? leads.find((l) => host(l.website) === h) : undefined;
  const go = async () => {
    if (!h) return setMsg({ text: tr("כתובת אתר לא תקינה") });
    const site = /^https?:\/\//i.test(url.trim()) ? url.trim() : "https://" + url.trim();
    if (dup) { setMsg({ text: tr("כבר קיים ב-CRM — סורק שוב: ") + dup.name, id: dup.id }); await onScan({ ...dup, website: dup.website || site }); return; }
    const l: Lead = { id: uid("LEAD"), name: name.trim() || nameOf(h), industry: ind || UNCLASSIFIED, sub_industry: "", product_match: "", use_case: "", volume_tons: 0, value_usd: 0, tier: "Tier 3 - New (to qualify)", department: "", contact_role: "", status: "new", stage: "prospect", website: site, source: "אתר — נמצא בחיפוש ברשת" } as Lead;
    onAdd(l); setMsg({ text: "✓ " + l.name + tr(" נוסף — סורק עכשיו…"), id: l.id }); setUrl(""); setName("");
    await onScan(l);
  };
  return (
    <div className="border border-brand-100 bg-brand-50/40 rounded-xl p-2 space-y-1 text-sm">
      <div className="font-bold">➕ {tr("אתר חדש שמצאתי — הוסף וסרוק")}</div>
      <div className="flex flex-wrap gap-2 items-center">
        <input dir="ltr" className={inputCls + " flex-1 min-w-[220px]"} placeholder="https://www.company.co.il" value={url} onChange={(e) => { setUrl(e.target.value); setMsg(null); }} onKeyDown={(e) => { if (e.key === "Enter" && !busy) go(); }} />
        <input className={inputCls + " !w-44"} placeholder={h ? nameOf(h) : tr("שם החברה (לא חובה)")} value={name} onChange={(e) => setName(e.target.value)} />
        <select className={inputCls + " !w-60"} value={ind} onChange={(e) => setInd(e.target.value)}><option value="">{tr("תעשייה (לא חובה)")}</option>{industryOptions(inds).map((i) => <option key={i} value={i}>{i}</option>)}</select>
        <button className={btnPrimary} disabled={busy || !h} onClick={go}>🔎 {dup ? tr("סרוק שוב") : tr("הוסף וסרוק")}</button>
      </div>
      {dup && !msg && <div className="text-xs text-amber-700">⚠ {tr("האתר כבר קיים אצל")} <Link href={"/leads/" + dup.id} className="underline">{dup.name}</Link></div>}
      {msg && <div className="text-xs text-emerald-700">{msg.text} {msg.id && <Link href={"/leads/" + msg.id} className="underline">{tr("לכרטיס")}</Link>}</div>}
      <div className="text-[11px] text-slate-400">{tr("נכנס כלקוח פוטנציאלי (Tier 3). את שם החברה, איש הקשר והטלפון משלימים אחר כך בכרטיס.")}</div>
    </div>
  );
}
