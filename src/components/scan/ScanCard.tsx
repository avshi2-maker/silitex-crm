"use client";
// ScanCard.tsx (src/components/scan/ScanCard.tsx) · updated 22.10.2026 07:35 (Asia/Jerusalem) — scan response read safely (time-out → clear message) · 20.10.2026 06:00 (Asia/Jerusalem) — 🔎 WEBSITE SCAN on the customer page: one tap reads the customer's site → products + Silitex matches + R&D questions, saved on the customer; "apply" copies the matches into the recommended products. Token meter + export bar.
import { useState } from "react";
import { Card, btnPrimary, btnGhost } from "@/components/ui";
import TokenMeter from "@/components/TokenMeter";
import ExportBar from "@/components/ExportBar";
import ScanView from "./ScanView";
import { scanOf, withScan, skuFromScan, scanText, type ScanResult, readScan } from "@/lib/scan";
import type { Lead, Usage } from "@/lib/types";
import { useLang } from "@/i18n";
export default function ScanCard({ lead, onSave, onSpend, spend }: { lead: Lead; onSave: (l: Lead) => void; onSpend: (tokens: number, cost: number) => void; spend: { tokens: number; cost: number } }) {
  const { t: tr } = useLang();
  const saved = scanOf(lead); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [usage, setUsage] = useState<Usage | null>(null);
  const run = async () => {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: lead.name, website: lead.website, industry: lead.industry }) });
      const j = await readScan(r); if (j.usage) { setUsage(j.usage); onSpend(j.usage.input_tokens + j.usage.output_tokens, j.usage.cost_usd); }
      if (!r.ok || !j.data) throw new Error(j.error || tr("לא התקבלה תשובה"));
      const res: ScanResult = { data: j.data, at: j.at, pages: j.pages, urls: j.urls || [], sector: j.sector || "" }; onSave(withScan(lead, res));
    } catch (e) { setErr(e instanceof Error ? e.message : "error"); }
    setBusy(false);
  };
  return (
    <Card className="space-y-2">
      <div className="flex items-center gap-2"><div className="font-bold flex-1">🔎 {tr("סריקת אתר הלקוח")}</div>
        <button className={btnPrimary + " text-sm"} disabled={busy || !lead.website} onClick={run}>{busy ? tr("סורק… (עד דקה)") : saved ? "🔄 " + tr("סרוק שוב") : "🔎 " + tr("סרוק + התאם Silitex")}</button></div>
      {!lead.website && <div className="text-xs text-amber-700">{tr("חסר אתר — הוסף כתובת אתר בטופס הלקוח")}</div>}
      {err && <div className="text-xs text-red-600">{err}</div>}
      {saved && <ScanView r={saved} />}
      {saved && skuFromScan(saved) && <button className={btnGhost + " text-xs"} onClick={() => onSave({ ...lead, recommended_sku: skuFromScan(saved) })}>⤵ {tr("העתק את ההתאמות למוצרים המומלצים")}</button>}
      {(busy || usage) && <TokenMeter usage={usage} sessionTokens={spend.tokens} sessionCost={spend.cost} busy={busy} />}
      {saved && <ExportBar title={tr("סריקת אתר") + " — " + lead.name} text={scanText(lead.name, saved)} filename={"scan_" + lead.id + ".txt"} />}
    </Card>
  );
}
