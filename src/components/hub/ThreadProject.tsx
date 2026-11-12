"use client";
// ThreadProject.tsx (src/components/hub/ThreadProject.tsx) · created 12.11.2026 05:45 (Asia/Jerusalem) — v1.10.3 📁 project strip on a Hub thread: #SPR ref + card link · the project's OTHER threads (customer side) one click away · reply with the project ref: [#SPR · v] subject (📋 copy), To / Cc from the last mail, ✉ open in Outlook
import { useState } from "react";
import Link from "next/link";
import { btnGhost, inputCls } from "@/components/ui";
import { useProjects } from "@/lib/use-projects";
import { refLabel, stampSubject, stageText } from "@/lib/projects";
import { fmtDateTime } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Thread, HubMsg } from "@/lib/types";

const OURS = /sapirim\.com/i;
const addrs = (s?: string) => (s || "").match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g)?.map((x) => x.toLowerCase()) || [];
/** reply-all recipients: To = sender of the last incoming mail, Cc = everyone else on it (not us) */
export function replyTo(msgs: HubMsg[]): { to: string; cc: string } {
  const last = [...msgs].sort((a, b) => b.at.localeCompare(a.at)).find((m) => m.direction === "in") || [...msgs].sort((a, b) => b.at.localeCompare(a.at))[0];
  if (!last) return { to: "", cc: "" };
  const to = last.direction === "in" ? addrs(last.from)[0] || "" : addrs(last.to)[0] || "";
  const cc = [...new Set([...addrs(last.from), ...addrs(last.to)])].filter((a) => a !== to && !OURS.test(a));
  return { to, cc: cc.join("; ") };
}
type Sib = { th: Thread; msgs: HubMsg[] };
type Props = { pid: string; th: Thread; msgs: HubMsg[]; siblings: Sib[]; onSelect?: (id: string) => void };
export default function ThreadProject({ pid, th, msgs, siblings, onSelect }: Props) {
  const { t: tr } = useLang(); const { list } = useProjects({ id: pid }); const p = list?.find((x) => x.id === pid) || null; const [copied, setCopied] = useState("");
  const subject = stampSubject("Re: " + th.subject.replace(/^((re|fw|fwd|r|i)\s*:\s*)+/i, ""), p || { id: pid, version: 1 });
  const { to, cc } = replyTo(msgs);
  const mailto = "mailto:" + encodeURIComponent(to) + "?subject=" + encodeURIComponent(subject) + (cc ? "&cc=" + encodeURIComponent(cc) : "");
  const copy = (k: string, v: string) => { navigator.clipboard?.writeText(v).then(() => { setCopied(k); setTimeout(() => setCopied(""), 2000); }).catch(() => {}); };
  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <b>📁 {p ? refLabel(p) : "#" + pid}</b>{p && <span className="text-xs text-slate-600">{stageText(p.stage)} · {p.lead_name}</span>}
        <Link href={"/projects/" + pid} className="text-xs underline text-brand-600 ms-auto">{tr("פתח כרטיס פרויקט")} ↗</Link>
      </div>
      {siblings.length > 0 && <div className="space-y-1">
        <div className="text-xs text-slate-600">🔗 {tr("עוד התכתבות באותו פרויקט:")}</div>
        {siblings.map(({ th: s, msgs: ms }) => { const last = [...ms].sort((a, b) => b.at.localeCompare(a.at))[0]; return (
          <button key={s.id} className="w-full text-start text-xs bg-white border rounded-lg px-2 py-1 hover:bg-amber-100" onClick={() => onSelect?.(s.id)} dir="auto">
            {s.dept === "il" ? "🇮🇱" : "🇮🇹"} {s.subject.slice(0, 90)} · {ms.length} {tr("הודעות")} · {fmtDateTime(s.last_at)}{last ? " · " + (last.direction === "out" ? "→ " : "← ") + last.body.replace(/\s+/g, " ").slice(0, 70) : ""}
          </button>); })}
      </div>}
      <div className="space-y-1">
        <div className="text-xs text-slate-600">✉ {tr("תשובה עם מספר הפרויקט")}</div>
        <div className="flex gap-1"><input readOnly className={inputCls + " text-xs"} value={subject} dir="ltr" /><button className={btnGhost} onClick={() => copy("s", subject)}>{copied === "s" ? "✓" : "📋"}</button></div>
        <div className="text-xs text-slate-600" dir="ltr">To: {to || "—"}{cc ? " · Cc: " + cc : ""}</div>
        <div className="flex flex-wrap gap-2"><a href={mailto} className={btnGhost}>✉ {tr("פתח ב-Outlook")}</a><button className={btnGhost} onClick={() => copy("r", to + (cc ? "; " + cc : ""))}>{copied === "r" ? "✓" : "📋"} {tr("נמענים")}</button></div>
      </div>
    </div>
  );
}
