"use client";
// OrderCustomer.tsx (src/components/orders/OrderCustomer.tsx) · created 16.11.2026 17:40 (Asia/Jerusalem) — v1.13.0 ✍ sample order → CUSTOMER first: printable Hebrew form (🖨 / PDF) + short mail
// "view → confirm → sign → mail back". ✉ opens the mail with the subject + body (attach the PDF), 📋 copies. The signed copy (photo / PDF) is uploaded here → stage "signed" → only then the Silitex mail opens.
import { useRef, useState } from "react";
import { Card, btnPrimary, btnGhost, inputCls } from "@/components/ui";
import ExportBar from "@/components/ExportBar";
import { customerMail } from "@/lib/orders";
import { uploadOrderFile } from "@/lib/use-orders";
import { stageNo } from "@/config/orders";
import { fmtDate } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Order } from "@/lib/types";

type Props = { o: Order; version: number; onSave: (p: Partial<Order>, note?: string) => Promise<unknown> };
export default function OrderCustomer({ o, version, onSave }: Props) {
  const { t: tr } = useLang(); const m = customerMail(o, version); const [copied, setCopied] = useState(""); const [busy, setBusy] = useState(""); const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null); const signed = (o.files || []).filter((f) => f.kind === "signed");
  const copy = (k: string, v: string) => navigator.clipboard?.writeText(v).then(() => { setCopied(k); setTimeout(() => setCopied(""), 2000); }).catch(() => {});
  const mailto = "mailto:" + encodeURIComponent(m.to) + "?subject=" + encodeURIComponent(m.subject) + "&body=" + encodeURIComponent(m.body);
  const sent = async () => { setBusy("sent"); try { await onSave({ stage: "customer_sent" }, "📨 נשלח ללקוח לחתימה" + (m.to ? " · " + m.to : "")); } catch { /* toast */ } setBusy(""); };
  const upload = async (f: File) => {
    setBusy("up"); setErr("");
    try { const url = await uploadOrderFile(o.id, f); const files = [...(o.files || []), { kind: "signed", url, name: f.name, at: new Date().toISOString() }];
      await onSave({ files, ...(stageNo(o.kind, o.stage) < stageNo(o.kind, "signed") ? { stage: "signed" } : {}) }, "✍ טופס חתום התקבל מהלקוח · " + f.name); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); } setBusy("");
  };
  return (
    <Card className="space-y-3 border-2 border-sky-300">
      <div className="flex flex-wrap items-center gap-2"><b className="text-lg">① ✍ {tr("ללקוח: לאישור וחתימה")}</b><span className="text-xs text-slate-500">{tr("הדוגמה עוברת ל-Silitex רק אחרי שהטופס החתום חזר.")}</span></div>
      <ol className="text-sm space-y-1 list-decimal ps-5">
        <li>{tr("לבדוק את פרטי ההזמנה למטה ולשמור.")}</li>
        <li><a href={"/orders/" + o.id + "/print"} target="_blank" rel="noreferrer" className="underline font-bold">🖨 {tr("פתח טופס ללקוח")}</a> {tr("→ הדפס / שמור כ-PDF.")}</li>
        <li>{tr("שלח ללקוח את המייל הקצר עם ה-PDF מצורף.")}</li>
        <li>{tr("כשהטופס החתום חוזר — העלה אותו כאן (צילום או PDF).")}</li>
      </ol>
      <label className="text-xs text-slate-500 block">{tr("נושא")}<div className="flex gap-1 mt-1"><input readOnly className={inputCls} value={m.subject} dir="auto" /><button className={btnGhost} onClick={() => copy("s", m.subject)}>{copied === "s" ? "✓" : "📋"}</button></div></label>
      <pre className="whitespace-pre-wrap font-[inherit] text-sm bg-slate-50 border rounded-lg p-3" dir="rtl">{m.body}</pre>
      <div className="flex flex-wrap gap-2">
        <a href={mailto} className={btnPrimary + " min-h-[44px] inline-flex items-center"}>✉ {tr("פתח מייל ללקוח")}{m.to ? " · " + m.to : ""}</a>
        <button className={btnGhost + " min-h-[44px]"} onClick={() => copy("b", m.body)}>{copied === "b" ? "✓" : "📋"} {tr("העתק גוף המייל")}</button>
        {stageNo(o.kind, o.stage) < stageNo(o.kind, "customer_sent") && <button className={btnGhost + " min-h-[44px]"} disabled={!!busy} onClick={sent}>📨 {tr("סמן: נשלח ללקוח")}</button>}
      </div>
      {!m.to && <div className="text-xs text-amber-700">{tr("אין מייל ללקוח בהזמנה — מלא בפרטי ההזמנה.")}</div>}
      <ExportBar title={m.subject} text={m.body} filename={o.id + "_customer"} />
      <div className="border-t pt-3 space-y-2">
        <input ref={file} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        <button className={btnPrimary + " min-h-[44px]"} disabled={!!busy} onClick={() => file.current?.click()}>📷 {busy === "up" ? tr("מעלה…") : tr("העלה טופס חתום מהלקוח")}</button>
        {err && <div className="text-xs text-red-700">{err}</div>}
        {signed.map((f, i) => <div key={i} className="text-sm">✍ <a href={f.url} target="_blank" rel="noreferrer" className="underline">{f.name}</a> <span className="text-xs text-slate-500">· {fmtDate(f.at)}</span></div>)}
      </div>
    </Card>
  );
}
