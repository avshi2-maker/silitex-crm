"use client";
// FollowBot.tsx (src/components/today/FollowBot.tsx) · created 08.11.2026 07:10 (Asia/Jerusalem) — v1.6.0
// 🔔 Follow-up bot on "My day": reads every customer mail thread (Outlook → Hub). We wrote last + no answer →
// opens a task "🔔 מעקב" due N days after our mail (N = your setting) → it shows in באיחור / היום with "✉ תזכורת".
// Customer answered after the task was opened → the task closes itself and the answer is logged on the customer.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, Badge, inputCls } from "@/components/ui";
import { useStore } from "@/lib/store";
import { isClosed } from "@/config/stages";
import { addDays, fmtDate, todayIso } from "@/lib/format";
import { waitingCustomers, customerAnswered, isFollow, followKind, followDays, DAYS_KEY, type Waiting } from "@/lib/followup";
import { useLang } from "@/i18n";
import type { HubMsg, Thread } from "@/lib/types";

const SEEN = "sx-follow-seen"; // our-mail ids the bot already opened a task for (a ticked task is not re-opened)
const seen = (): string[] => { try { return JSON.parse(localStorage.getItem(SEEN) || "[]"); } catch { return []; } };
const markSeen = (id: string) => { try { localStorage.setItem(SEEN, JSON.stringify([...seen(), id].slice(-500))); } catch { /* */ } };

export default function FollowBot() {
  const { t: tr } = useLang();
  const { state, ready, addTask, toggleTask, addActivity } = useStore();
  const [hub, setHub] = useState<{ threads: Thread[]; msgs: HubMsg[] } | null>(null);
  const [days, setDays] = useState(5); const ran = useRef(false);
  useEffect(() => { setDays(followDays()); fetch("/api/hub/ingest", { cache: "no-store" }).then((r) => r.json()).then((j) => setHub({ threads: j.threads || [], msgs: j.msgs || [] })).catch(() => {}); }, []);
  const waiting: Waiting[] = hub && ready ? waitingCustomers(state.leads.filter((l) => !isClosed(l.stage)), hub.threads, hub.msgs) : [];
  useEffect(() => {
    if (!hub || !ready || ran.current) return; ran.current = true;
    const open = state.tasks.filter((t) => !t.done && isFollow(t));
    open.forEach((t) => { const ans = customerAnswered(t, hub.threads, hub.msgs); if (ans) { toggleTask(t.id); addActivity(t.lead_id, "email", "✅ " + tr("הלקוח ענה") + " (" + fmtDate(ans.at.slice(0, 10)) + ") — " + tr("המעקב נסגר אוטומטית")); } });
    const s = seen(); const d = followDays();
    waiting.forEach((w) => {
      if (s.includes(w.lastOut.id) || open.some((t) => t.lead_id === w.lead.id)) return;
      addTask({ lead_id: w.lead.id, lead_name: w.lead.name, title: "🔔 " + tr("מעקב: אין תשובה ל-") + "«" + w.thread.subject.slice(0, 90) + "»", due: addDays(w.lastOut.at.slice(0, 10), d), cadence: "once", kind: followKind() });
      markSeen(w.lastOut.id);
    });
  }, [hub, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const setD = (n: number) => { setDays(n); try { localStorage.setItem(DAYS_KEY, String(n)); } catch { /* */ } };
  const today = todayIso();
  return (
    <Card className="space-y-2">
      <div className="flex flex-wrap items-center gap-2"><h2 className="font-bold flex-1">🔔 {tr("בוט מעקב מיילים ללקוחות")} <Badge tone={waiting.length ? "amber" : "green"}>{waiting.length} {tr("ממתינים לתשובה")}</Badge></h2>
        <label className="text-xs text-slate-500 flex items-center gap-1">{tr("תזכורת אחרי")}<select className={inputCls + " !w-auto !py-1"} value={days} onChange={(e) => setD(Number(e.target.value))}>{[2, 3, 5, 7, 10, 14].map((n) => <option key={n} value={n}>{n}</option>)}</select>{tr("ימים")}</label></div>
      <p className="text-xs text-slate-500">{tr("כל מייל ששלחת ללקוח ולא נענה → משימת 🔔 ביום התזכורת (באיחור / היום למטה) עם כפתור ✉ תזכורת. לקוח ענה → המשימה נסגרת לבד.")}</p>
      {waiting.length > 0 && <ul className="text-sm divide-y">{waiting.slice(0, 10).map((w) => { const due = addDays(w.lastOut.at.slice(0, 10), days); return (
        <li key={w.lead.id} className="py-1.5 flex flex-wrap items-center gap-2">
          <Link href={"/leads/" + w.lead.id} className="font-medium text-brand-700 hover:underline">{w.lead.name}</Link>
          <span className="text-xs text-slate-500 flex-1 truncate" dir="auto">{w.thread.subject}</span>
          <span className="text-xs">{tr("נשלח")} {fmtDate(w.lastOut.at.slice(0, 10))} · <span dir="ltr">{w.days}</span> {tr("ימים")}</span>
          <Badge tone={due <= today ? "red" : "slate"}>{due <= today ? tr("להזכיר עכשיו") : tr("תזכורת") + " " + fmtDate(due)}</Badge>
        </li>); })}</ul>}
    </Card>
  );
}
