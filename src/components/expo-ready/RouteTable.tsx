"use client";
// RouteTable.tsx (src/components/expo-ready/RouteTable.tsx) · created 28.10.2026 08:30 (Asia/Jerusalem) — v1.3.0 day route: stands hall by hall, with a ✓ box to tick on paper
import { route, type Stand } from "@/lib/expo-ready";

const th = "border-b p-1.5 text-start bg-slate-50 font-semibold"; const td = "border-b p-1.5 align-top";
export default function RouteTable({ top }: { top: Stand[] }) {
  let n = 0;
  return (
    <div className="overflow-x-auto" dir="ltr">
      <table className="w-full text-sm border-collapse">
        <thead><tr><th className={th}>#</th><th className={th}>Hall</th><th className={th}>Stand</th><th className={th}>Company</th><th className={th}>Grade</th><th className={th}>Lead product</th><th className={th}>✓</th></tr></thead>
        <tbody>{route(top).map(([hall, list]) => list.map((s) => { n += 1; return (
          <tr key={s.company + n}><td className={td}>{n}</td><td className={td}>{hall}</td><td className={td}>{s.stand || "—"}{s.stand_verified === false ? " ⚠" : ""}</td><td className={td + " font-medium"}>{s.company}</td><td className={td}>{s.grade}</td><td className={td}>{s.silitex_products[0] || "—"}</td><td className={td}>☐</td></tr>
        ); }))}</tbody>
      </table>
      <div className="text-xs text-slate-500 mt-1">⚠ = stand not on the official list yet — confirm on the show app / floor plan.</div>
    </div>
  );
}
