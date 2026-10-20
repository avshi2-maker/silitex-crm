"use client";
// PortalClock.tsx (src/portal/components/PortalClock.tsx) · created 20.10.2026 17:40 (Asia/Jerusalem) — PUBLIC PORTAL header clock: live digital time (HH:MM:SS) + date stamp dd/mm/yyyy, Israel time.
import { useEffect, useState } from "react";
export default function PortalClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i); }, []);
  if (!now) return <div className="w-[118px]" />;
  const tz = { timeZone: "Asia/Jerusalem" } as const;
  const time = now.toLocaleTimeString("en-GB", { ...tz, hour12: false });
  const date = now.toLocaleDateString("en-GB", { ...tz, day: "2-digit", month: "2-digit", year: "numeric" });
  return (
    <div className="font-mono text-center leading-tight rounded-lg bg-black/30 px-3 py-1" dir="ltr" aria-label={date + " " + time}>
      <div className="text-amber-300 text-base tracking-wider">{time}</div>
      <div className="text-[11px] opacity-80">{date}</div>
    </div>
  );
}
