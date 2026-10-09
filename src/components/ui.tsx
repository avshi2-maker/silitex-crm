// ui.tsx (src/components/ui.tsx) · updated 09.10.2026 13:40 (Asia/Jerusalem)
import type { ReactNode } from "react";
import BackLink from "./BackLink";
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={"bg-white border rounded-xl p-4 shadow-sm " + className}>{children}</div>;
}
export function H1({ children, sub }: { children: ReactNode; sub?: string }) {
  return (<div className="mb-4"><BackLink /><h1 className="text-2xl font-bold text-brand-900">{children}</h1>{sub && <p className="text-sm text-slate-500">{sub}</p>}</div>);
}
export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: string }) {
  const tones: Record<string, string> = { slate: "bg-slate-100 text-slate-700", green: "bg-emerald-100 text-emerald-800", blue: "bg-blue-100 text-blue-800", amber: "bg-amber-100 text-amber-800", red: "bg-red-100 text-red-800", purple: "bg-purple-100 text-purple-800" };
  return <span className={"inline-block text-xs px-2 py-0.5 rounded-full " + (tones[tone] || tones.slate)}>{children}</span>;
}
export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (<Card><div className="text-xs text-slate-500">{label}</div><div className="text-2xl font-bold text-brand-900">{value}</div>{hint && <div className="text-xs text-slate-400">{hint}</div>}</Card>);
}
export const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500";
export const btnPrimary = "px-4 py-2 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-50";
export const btnGhost = "px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-slate-50";
export function certTone(c: string): string {
  if (/kosher/i.test(c)) return "purple";
  if (/fda|e900/i.test(c)) return "green";
  if (/eco|gots|bio|plant/i.test(c)) return "blue";
  return "slate";
}
