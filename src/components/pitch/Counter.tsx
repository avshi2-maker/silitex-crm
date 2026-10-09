"use client";
// Counter.tsx (src/components/pitch/Counter.tsx) · updated 09.10.2026 12:30 (Asia/Jerusalem) — animated KPI number
import { useEffect, useState } from "react";
export default function Counter({ to, prefix = "", suffix = "", ms = 1400, decimals = 0 }: { to: number; prefix?: string; suffix?: string; ms?: number; decimals?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t0 = performance.now(); let raf = 0; const step = (t: number) => { const p = Math.min(1, (t - t0) / ms); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf); }, [to, ms]);
  return <span className="tabular-nums">{prefix}{v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}
