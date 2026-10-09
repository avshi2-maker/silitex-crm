"use client";
// Clock.tsx (src/components/Clock.tsx) · updated 09.10.2026 11:30 (Asia/Jerusalem) — live digital date + time (dd/mm/yyyy HH:MM:SS, Israel time)
import { useEffect, useState } from "react";
import { fmtDate } from "@/lib/format";
export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  if (!now) return <div className="h-10" />;
  const hh = String(now.getHours()).padStart(2, "0"), mi = String(now.getMinutes()).padStart(2, "0"), ss = String(now.getSeconds()).padStart(2, "0");
  return (
    <div className="font-mono text-center bg-brand-700/60 rounded-lg px-2 py-1 leading-tight" dir="ltr">
      <div className="text-lg tracking-widest tabular-nums">{hh}:{mi}<span className="text-blue-300 text-sm">:{ss}</span></div>
      <div className="text-[11px] text-blue-200 tabular-nums">{fmtDate(now)}</div>
    </div>
  );
}
