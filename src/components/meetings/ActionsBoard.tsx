"use client";
// ActionsBoard.tsx (src/components/meetings/ActionsBoard.tsx) · updated 16.10.2026 18:10 (Asia/Jerusalem) — open action items per party (Sapirim / Silitex) carried across all meetings; ✓ marks done (+ CRM task), 📌 creates a CRM task for a Sapirim item
import Link from "next/link";
import { Badge } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import type { MeetingAction, Party } from "@/lib/meeting-types";
import { useLang } from "@/i18n";
type Props = { actions: MeetingAction[]; meetings: { id: string; held_at: string }[]; onToggle: (a: MeetingAction) => void; onTask: (a: MeetingAction) => void; showDone?: boolean; linkMeeting?: boolean };
const COLS: { p: Party; he: string; tone: string }[] = [{ p: "sapirim", he: "אצלנו — Sapirim", tone: "blue" }, { p: "silitex", he: "ממתין ל-Silitex", tone: "amber" }];
export default function ActionsBoard({ actions, meetings, onToggle, onTask, showDone = false, linkMeeting = true }: Props) {
  const { t: tr } = useLang();
  const date = (mid: string) => meetings.find((m) => m.id === mid)?.held_at || "";
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {COLS.map((c) => {
        const list = actions.filter((a) => a.party === c.p && (showDone || a.status === "open"));
        return (
          <div key={c.p} className="border rounded-xl p-3 bg-white">
            <div className="flex items-center justify-between mb-2"><h3 className="font-bold">{tr(c.he)}</h3><Badge tone={c.tone}>{list.filter((a) => a.status === "open").length} {tr("פתוחות")}</Badge></div>
            {list.length === 0 && <p className="text-sm text-slate-400">{tr("אין משימות פתוחות.")}</p>}
            <ul className="space-y-1.5 text-sm" dir="ltr">
              {list.map((a) => (
                <li key={a.id} className={"flex items-start gap-2 " + (a.status === "done" ? "opacity-50 line-through" : "")}>
                  <input type="checkbox" className="mt-1" checked={a.status === "done"} onChange={() => onToggle(a)} title="Done" />
                  <span className="flex-1"><b className="text-slate-500 font-medium">{a.owner}:</b> {a.task}
                    {a.due && <span className={"ms-1 text-xs " + (a.status === "open" && a.due < today ? "text-red-600 font-bold" : "text-slate-400")}>· {fmtDate(a.due)}</span>}
                    {linkMeeting && <Link href={"/meetings/" + a.meeting_id} className="ms-1 text-xs text-brand-600 underline">{fmtDate(date(a.meeting_id))}</Link>}
                  </span>
                  {c.p === "sapirim" && a.status === "open" && (a.task_id ? <span title={tr("משימה ב-CRM")} className="text-xs">✅</span> : <button onClick={() => onTask(a)} title={tr("צור משימה ב-CRM")} className="text-xs px-1.5 rounded border hover:bg-brand-50">📌</button>)}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
