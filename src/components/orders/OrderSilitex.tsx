"use client";
// OrderSilitex.tsx (src/components/orders/OrderSilitex.tsx) · created 16.11.2026 17:45 (Asia/Jerusalem) — v1.13.0 🇮🇹 the real order → Silitex purchasing (English): To Isabel (international@), Cc the project's Silitex team,
// [#SPR · v] subject, full data + shipping instructions. A SAMPLE order stays locked until the customer's signed copy is back (attach it to the mail).
import { useState } from "react";
import { Card, btnPrimary, btnGhost, inputCls } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import { silitexMail } from "@/lib/orders";
import { stageNo } from "@/config/orders";
import { useLang } from "@/i18n";
import type { Order, ProjectMember } from "@/lib/types";

const PURCHASING = "international@silitex.it";
type Props = { o: Order; team: ProjectMember[]; version: number; onSave: (p: Partial<Order>, note?: string) => Promise<unknown> };
export default function OrderSilitex({ o, team, version, onSave }: Props) {
  const { t: tr } = useLang(); const [copied, setCopied] = useState(""); const [ref, setRef] = useState(o.silitex_ref || ""); const [busy, setBusy] = useState(false);
  const signed = (o.files || []).find((f) => f.kind === "signed");
  const locked = o.kind === "sample" && !signed;
  const m = silitexMail(o, signed?.at, version);
  const cc = [...new Set(team.map((t) => t.email).filter((e) => e && e !== PURCHASING))].join("; ");
  const mailto = "mailto:" + PURCHASING + "?subject=" + encodeURIComponent(m.subject) + (cc ? "&cc=" + encodeURIComponent(cc) : "") + "&body=" + encodeURIComponent(m.body);
  const copy = (k: string, v: string) => navigator.clipboard?.writeText(v).then(() => { setCopied(k); setTimeout(() => setCopied(""), 2000); }).catch(() => {});
  const run = async (p: Partial<Order>, note: string) => { setBusy(true); try { await onSave(p, note); } catch { /* toast */ } setBusy(false); };
  const before = stageNo(o.kind, o.stage) < stageNo(o.kind, "silitex_sent");
  return (
    <Card className={"space-y-3 border-2 " + (locked ? "border-slate-200 opacity-70" : "border-teal-600")}>
      <b className="text-lg">{o.kind === "sample" ? "②" : "①"} 🇮🇹 {tr("ההזמנה ל-Silitex (רכש)")}</b>
      {locked ? <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">🔒 {tr("ננעל עד שהטופס החתום של הלקוח מועלה בשלב ①.")}</div> : <>
        <div className="text-xs text-slate-600 space-y-1" dir="ltr"><div><b>To:</b> Isabel Colognese &lt;{PURCHASING}&gt;</div>{cc && <div><b>Cc:</b> {cc}</div>}</div>
        <label className="text-xs text-slate-500 block">{tr("נושא")}<div className="flex gap-1 mt-1"><input readOnly className={inputCls} value={m.subject} dir="ltr" /><button className={btnGhost} onClick={() => copy("s", m.subject)}>{copied === "s" ? "✓" : "📋"}</button></div></label>
        <pre className="whitespace-pre-wrap font-mono text-xs bg-slate-50 border rounded-lg p-3" dir="ltr">{m.body}</pre>
        {signed && <div className="text-xs">📎 {tr("לצרף למייל:")} <a href={signed.url} target="_blank" rel="noreferrer" className="underline">{signed.name}</a></div>}
        <div className="flex flex-wrap gap-2">
          <a href={mailto} className={btnPrimary + " min-h-[44px] inline-flex items-center"}>✉ {tr("פתח מייל ל-Silitex")}</a>
          <button className={btnGhost + " min-h-[44px]"} onClick={() => copy("b", m.body)}>{copied === "b" ? "✓" : "📋"} {tr("העתק גוף המייל")}</button>
          {before && <button className={btnGhost + " min-h-[44px]"} disabled={busy} onClick={() => run({ stage: "silitex_sent" }, "🇮🇹 ההזמנה נשלחה לרכש Silitex")}>🇮🇹 {tr("סמן: נשלח ל-Silitex")}</button>}
        </div>
        <ExportBar title={m.subject} text={m.body} filename={o.id + "_silitex"} />
        <div className="flex flex-wrap gap-2 items-end border-t pt-3">
          <label className="text-xs text-slate-500">{tr("מספר ההזמנה של Silitex")}<input className={inputCls + " mt-1"} value={ref} onChange={(e) => setRef(e.target.value)} dir="ltr" /></label>
          <button className={btnGhost + " min-h-[40px]"} disabled={busy || !ref.trim()} onClick={() => run({ silitex_ref: ref.trim(), ...(stageNo(o.kind, o.stage) < stageNo(o.kind, "confirmed") ? { stage: "confirmed" } : {}) }, "✅ Silitex אישרו · " + ref.trim())}>✅ {tr("Silitex אישרו")}</button>
        </div>
      </>}
    </Card>
  );
}
