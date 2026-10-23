"use client";
// ScanPulse.tsx (src/components/ScanPulse.tsx) · created 23.10.2026 06:55 (Asia/Jerusalem) — LIVE SCAN SIGNAL on every CRM page: while the server scan queue works → a pill with a pulsing dot "🔎 סורק בשרת · N נותרו · עכשיו: <company> 0:42 · ~X דק'" (click → /scan); when the queue empties → green "✓ הסריקה הסתיימה · done · failed" for 15 s; idle → nothing. Polls /api/scan/jobs (10 s while busy, 45 s idle, paused in a hidden tab).
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/i18n";

type Run = { name: string; started_at: string | null };
type St = { queued: number; running: Run[]; done24: number; failed24: number; avgSec?: number };
const mmss = (s: number) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");

export default function ScanPulse() {
  const { t: tr } = useLang();
  const [st, setSt] = useState<St | null>(null); const [now, setNow] = useState(Date.now());
  const [doneMsg, setDoneMsg] = useState<{ done: number; failed: number } | null>(null);
  const startRef = useRef<{ done: number; failed: number } | null>(null); const busyRef = useRef(false);
  useEffect(() => {
    let alive = true; let t: ReturnType<typeof setTimeout>;
    const poll = async () => {
      if (document.visibilityState === "visible") {
        try {
          const r = await fetch("/api/scan/jobs", { cache: "no-store" });
          if (r.ok) {
            const j = (await r.json()) as St; if (!alive) return;
            const busy = j.queued > 0 || j.running.length > 0;
            if (busy && !busyRef.current) { startRef.current = { done: j.done24, failed: j.failed24 }; setDoneMsg(null); }
            if (!busy && busyRef.current && startRef.current) { setDoneMsg({ done: Math.max(0, j.done24 - startRef.current.done), failed: Math.max(0, j.failed24 - startRef.current.failed) }); setTimeout(() => alive && setDoneMsg(null), 15000); }
            busyRef.current = busy; setSt(j);
          }
        } catch {}
      }
      if (alive) t = setTimeout(poll, busyRef.current ? 10000 : 45000);
    };
    poll(); const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => { alive = false; clearTimeout(t); clearInterval(tick); };
  }, []);
  const busy = !!st && (st.queued > 0 || st.running.length > 0);
  const base = "fixed bottom-5 left-20 z-[9998] rounded-full shadow-lg px-4 py-2 text-sm text-white flex items-center gap-2 print:hidden";
  if (doneMsg && !busy) return <Link href="/scan" className={base + " bg-emerald-600"}>✓ {tr("הסריקה הסתיימה")} · {doneMsg.done} {tr("נסרקו")}{doneMsg.failed ? " · " + doneMsg.failed + " " + tr("נכשלו") : ""}</Link>;
  if (!busy || !st) return null;
  const left = st.queued + st.running.length; const cur = st.running[0];
  const el = cur?.started_at ? Math.max(0, (now - Date.parse(cur.started_at)) / 1000) : 0;
  const per = st.avgSec || 45; const chains = Math.max(1, Math.min(2, st.running.length || 1));
  const eta = Math.max(1, Math.ceil(((st.queued * per) / chains + Math.max(0, per - el)) / 60));
  return (
    <Link href="/scan" className={base + " bg-slate-900"} title={tr("סריקת אתרי לקוחות")}>
      <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" /></span>
      <span>🔎 {tr("סורק בשרת")} · {left} {tr("נותרו")}{cur ? " · " + tr("עכשיו:") + " " + cur.name.split(" (")[0].slice(0, 24) + " " + mmss(el) : ""} · ~{eta} {tr("דק'")}</span>
    </Link>
  );
}
