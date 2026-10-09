"use client";
// IsraelMap.tsx (src/components/pitch/IsraelMap.tsx) · updated 09.10.2026 12:30 (Asia/Jerusalem) — simplified Israel outline + account pins by industry (lat/lon from leads.json)
import { useState } from "react";
import type { Lead } from "@/lib/types";
const OUTLINE: [number, number][] = [[33.09, 35.10], [33.10, 35.30], [33.28, 35.55], [33.30, 35.68], [33.00, 35.75], [32.80, 35.65], [32.70, 35.60], [32.40, 35.57], [32.00, 35.55], [31.75, 35.50], [31.40, 35.40], [31.05, 35.40], [30.90, 35.35], [30.50, 35.20], [30.00, 35.05], [29.55, 34.98], [29.49, 34.90], [29.70, 34.85], [30.30, 34.60], [30.80, 34.42], [31.22, 34.27], [31.45, 34.40], [31.60, 34.50], [31.67, 34.55], [31.80, 34.64], [32.08, 34.76], [32.33, 34.85], [32.50, 34.89], [32.69, 34.93], [32.83, 34.96], [32.90, 35.07], [33.00, 35.09]];
const COLORS: Record<string, string> = { Agriculture: "#16a34a", Water: "#0284c7", Paints: "#f59e0b", Detergents: "#7c3aed", Paper: "#a16207", Textiles: "#db2777", Rubber: "#475569", Metalworking: "#334155", Oil: "#111827", Food: "#ea580c" };
const colorOf = (ind: string) => Object.entries(COLORS).find(([k]) => ind.startsWith(k))?.[1] || "#E2007A";
const W = 260, H = 520;
const px = (lat: number, lon: number) => ({ x: ((lon - 34.2) / 1.6) * W, y: ((33.4 - lat) / 4.0) * H });
export default function IsraelMap({ leads }: { leads: Lead[] }) {
  const [hover, setHover] = useState<Lead | null>(null);
  const path = OUTLINE.map((p, i) => { const { x, y } = px(p[0], p[1]); return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }).join(" ") + " Z";
  const pins = leads.filter((l) => l.lat && l.lon);
  const inds = Array.from(new Set(pins.map((l) => l.industry)));
  return (
    <div className="flex gap-4 items-start">
      <svg viewBox={"0 0 " + W + " " + H} className="w-[260px] h-[520px] shrink-0">
        <path d={path} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
        {pins.map((l, i) => { const { x, y } = px(l.lat!, l.lon!); const j = (i % 3) - 1; return (
          <g key={l.id} onMouseEnter={() => setHover(l)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
            <circle cx={x + j * 6} cy={y + ((i % 2) ? 5 : -5)} r="7" fill={colorOf(l.industry)} opacity="0.9" stroke="white" strokeWidth="1.5"><animate attributeName="r" values="5;8;5" dur={(1.5 + (i % 5) * 0.3) + "s"} repeatCount="indefinite" /></circle>
          </g>); })}
        {hover && (() => { const { x, y } = px(hover.lat!, hover.lon!); const left = x > W / 2; return (<g><rect x={left ? x - 150 : x + 10} y={y - 22} width="140" height="34" rx="6" fill="#1B1B20" /><text x={left ? x - 143 : x + 17} y={y - 8} fill="white" fontSize="9" fontWeight="bold">{hover.name.slice(0, 28)}</text><text x={left ? x - 143 : x + 17} y={y + 5} fill="#cbd5e1" fontSize="8">{hover.city} · ${(hover.value_usd / 1000).toFixed(0)}k/yr</text></g>); })()}
      </svg>
      <div className="text-xs space-y-1 pt-2">
        <div className="font-bold text-sm mb-2">{pins.length} target accounts</div>
        {inds.map((ind) => (<div key={ind} className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{ background: colorOf(ind) }} /><span>{ind}</span><span className="text-slate-400">· {pins.filter((l) => l.industry === ind).length}</span></div>))}
        <div className="text-slate-400 pt-2">Hover a pin for the account.</div>
      </div>
    </div>
  );
}
