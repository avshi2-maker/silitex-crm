"use client";
// DocsCard.tsx (src/components/leads/DocsCard.tsx) · updated 09.10.2026 18:30 (Asia/Jerusalem) — documents sent to a lead (TDS / MSDS / price offers) + status; opens TdsPanel / OfferPanel
import { useState } from "react";
import { Card, Badge, btnGhost } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import TdsPanel from "./TdsPanel";
import OfferPanel from "./OfferPanel";
import type { Doc, DocStatus, Lead, Product } from "@/lib/types";
const TONE: Record<DocStatus, string> = { sent: "blue", accepted: "green", rejected: "red", expired: "slate" };
const HE: Record<DocStatus, string> = { sent: "נשלח", accepted: "התקבל ✓", rejected: "נדחה", expired: "פג תוקף" };
type Props = { lead: Lead; docs: Doc[]; matches: Product[]; onAdd: (d: Omit<Doc, "id">) => void; onStatus: (id: string, s: DocStatus) => void; onStage: (s: "quote" | "negotiation" | "won" | "lost") => void; spend: { tokens: number; cost: number }; addSpend: (t: number, c: number) => void };
export default function DocsCard({ lead, docs, matches, onAdd, onStatus, onStage, spend, addSpend }: Props) {
  const { t: tr } = useLang();
  const [open, setOpen] = useState<"" | "tds" | "msds" | "offer">("");
  const offers = docs.filter((d) => d.kind === "offer");
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h3 className="font-bold">{tr("מסמכים והצעות מחיר")} ({docs.length})</h3>
        <div className="flex gap-1">{(["tds", "msds", "offer"] as const).map((k) => <button key={k} className={btnGhost + (open === k ? " ring-2 ring-brand-500" : "")} onClick={() => setOpen(open === k ? "" : k)}>{k === "offer" ? tr("💶 הצעת מחיר") : k === "tds" ? "📄 TDS" : "🛡️ MSDS"}</button>)}</div>
      </div>
      {open === "offer" && <OfferPanel lead={lead} matches={matches} spend={spend} addSpend={addSpend} onSent={(d) => { onAdd(d); onStage("quote"); setOpen(""); }} />}
      {(open === "tds" || open === "msds") && <TdsPanel kind={open} lead={lead} matches={matches} spend={spend} addSpend={addSpend} onSent={(d) => { onAdd(d); setOpen(""); }} />}
      <ul className="text-sm space-y-2 mt-2">
        {docs.map((d) => (<li key={d.id} className="border rounded-lg p-2">
          <div className="flex flex-wrap justify-between gap-2"><span className="font-medium">{d.kind === "offer" ? "💶" : d.kind === "tds" ? "📄" : "🛡️"} {d.title}{d.amount_eur ? " · €" + d.amount_eur.toLocaleString("en-US") : ""}</span><Badge tone={TONE[d.status]}>{tr(HE[d.status])}</Badge></div>
          <div className="text-xs text-slate-500">{tr("נשלח")} {fmtDate(d.sent_at)} · {d.via}{d.valid_until ? " · " + tr("תוקף עד") + " " + fmtDate(d.valid_until) : ""}</div>
          {d.kind === "offer" && d.status === "sent" && (<div className="flex gap-1 mt-1"><button className="text-xs px-2 py-0.5 border rounded-full bg-white hover:bg-emerald-50" onClick={() => { onStatus(d.id, "accepted"); onStage("negotiation"); }}>{tr("התקבל → משא ומתן")}</button><button className="text-xs px-2 py-0.5 border rounded-full bg-white hover:bg-red-50" onClick={() => onStatus(d.id, "rejected")}>{tr("נדחה")}</button><button className="text-xs px-2 py-0.5 border rounded-full bg-white" onClick={() => onStatus(d.id, "expired")}>{tr("פג תוקף")}</button></div>)}
          {d.kind === "offer" && d.status === "accepted" && <button className="text-xs px-2 py-0.5 border rounded-full bg-emerald-500 text-white mt-1" onClick={() => onStage("won")}>{tr("הזמנה התקבלה → נסגר ✓")}</button>}
        </li>))}
        {docs.length === 0 && <li className="text-slate-400 text-xs">{tr("עדיין לא נשלחו מסמכים. שלח חבילת TDS או הצעת מחיר.")}</li>}
      </ul>
      {offers.length > 0 && <div className="text-xs text-slate-500 mt-2">{tr("סה\"כ הצעות: ")}€{offers.reduce((a, d) => a + (d.amount_eur || 0), 0).toLocaleString("en-US")}</div>}
    </Card>
  );
}
