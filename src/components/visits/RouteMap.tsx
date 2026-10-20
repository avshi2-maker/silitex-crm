"use client";
// RouteMap.tsx (src/components/visits/RouteMap.tsx) · updated 20.10.2026 05:20 (Asia/Jerusalem) — VISIT PLANNER map: Israel outline, all customers with a location (grey), selected stops numbered in route order with the driving line from the start point.
import { OUTLINE, px, W, H } from "@/components/pitch/IsraelMap";
import type { Pt } from "@/lib/geo";
type Stop = Pt & { id: string; name: string };
export default function RouteMap({ start, all, route, onToggle }: { start: Pt | null; all: Stop[]; route: Stop[]; onToggle: (id: string) => void }) {
  const path = OUTLINE.map((p, i) => { const { x, y } = px(p[0], p[1]); return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }).join(" ") + " Z";
  const chain = [...(start ? [start] : []), ...route].map((p) => px(p.lat, p.lon));
  return (
    <svg viewBox={"0 0 " + W + " " + H} className="w-full max-w-[300px] h-auto">
      <path d={path} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
      {chain.length > 1 && <polyline points={chain.map((c) => c.x.toFixed(1) + "," + c.y.toFixed(1)).join(" ")} fill="none" stroke="#E2007A" strokeWidth="2" strokeDasharray="4 3" />}
      {all.map((s) => { const { x, y } = px(s.lat, s.lon); const n = route.findIndex((r) => r.id === s.id); return (
        <g key={s.id} className="cursor-pointer" onClick={() => onToggle(s.id)}><title>{s.name}</title>
          <circle cx={x} cy={y} r={n >= 0 ? 8 : 4.5} fill={n >= 0 ? "#E2007A" : "#94a3b8"} stroke="white" strokeWidth="1.5" />
          {n >= 0 && <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">{n + 1}</text>}
        </g>); })}
      {start && (() => { const { x, y } = px(start.lat, start.lon); return <g><rect x={x - 6} y={y - 6} width="12" height="12" rx="2" fill="#1B1B20" /><text x={x} y={y + 3.5} textAnchor="middle" fontSize="8" fill="white">S</text></g>; })()}
    </svg>
  );
}
