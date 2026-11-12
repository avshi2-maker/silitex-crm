"use client";
// ThreadMsgs.tsx (src/components/hub/ThreadMsgs.tsx) · created 12.11.2026 05:40 (Asia/Jerusalem) — v1.10.3 thread messages NEWEST FIRST (yesterday's mails on top, no scrolling past old long mails) · quoted history folded (▸ show quoted) · 🆕 on the latest
import { useState } from "react";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/i18n";
import type { HubMsg } from "@/lib/types";

/** first line where the quoted older mail starts (Outlook EN/IT/FR/DE, Gmail EN/HE, "Sent from Outlook") */
const QUOTE = /^\s*(from:|da:|de:|von:|-{3,}\s*original|_{8,}|on .{4,120} wrote:|‫?בתאריך .*מאת|inviato da outlook|sent from outlook)/i;
export function splitQuote(body: string): [string, string] {
  const lines = (body || "").split(/\r?\n/); const i = lines.findIndex((l, n) => n > 0 && QUOTE.test(l));
  return i < 0 ? [body, ""] : [lines.slice(0, i).join("\n").trimEnd(), lines.slice(i).join("\n")];
}
function Msg({ m, latest }: { m: HubMsg; latest: boolean }) {
  const { t: tr } = useLang(); const [open, setOpen] = useState(false); const [head, quoted] = splitQuote(m.body);
  const box = "border rounded-lg p-2 text-sm " + (m.direction === "out" ? "bg-brand-50/40 border-brand-100" : "bg-white") + (latest ? " ring-2 ring-amber-300" : "");
  return (
    <div className={box} dir="ltr">
      <div className="text-xs text-slate-500">{latest && <b className="text-amber-700">🆕 {tr("אחרון")} · </b>}{m.direction === "out" ? "→ " : "← "}{m.from}{m.to ? " → " + m.to : ""} · {fmtDateTime(m.at)} · {m.source}</div>
      <pre className="whitespace-pre-wrap font-[inherit] mt-1">{head || m.body}</pre>
      {quoted && <button className="text-xs text-brand-600 underline mt-1" onClick={() => setOpen(!open)}>{open ? "▾ " + tr("הסתר ציטוט") : "▸ " + tr("הצג ציטוט")}</button>}
      {open && <pre className="whitespace-pre-wrap font-[inherit] mt-1 text-xs text-slate-500 border-t pt-1">{quoted}</pre>}
    </div>
  );
}
export default function ThreadMsgs({ msgs }: { msgs: HubMsg[] }) {
  const { t: tr } = useLang(); const list = [...msgs].sort((a, b) => b.at.localeCompare(a.at)); // newest first
  return (
    <div className="space-y-2 max-h-[520px] overflow-auto">
      {list.length > 1 && <div className="text-xs text-slate-400">↓ {tr("החדש למעלה")}</div>}
      {list.map((m, i) => <Msg key={m.id} m={m} latest={i === 0 && list.length > 1} />)}
      {list.length === 0 && <div className="text-xs text-slate-400">{tr("אין הודעות — הדבק מייל למטה.")}</div>}
    </div>
  );
}
