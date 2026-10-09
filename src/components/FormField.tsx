"use client";
// FormField.tsx (src/components/FormField.tsx) · updated 09.10.2026 13:20 (Asia/Jerusalem) — labelled input / select / textarea / rating
import { inputCls } from "./ui";
type Base = { label: string; value: string; onChange: (v: string) => void; required?: boolean };
export function Text({ label, value, onChange, required, type = "text", placeholder }: Base & { type?: string; placeholder?: string }) {
  return <label className="text-xs text-slate-500 block">{label}{required && " *"}<input type={type} className={inputCls + " mt-1"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} /></label>;
}
export function Area({ label, value, onChange, rows = 3 }: Base & { rows?: number }) {
  return <label className="text-xs text-slate-500 block">{label}<textarea className={inputCls + " mt-1"} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}
export function Select({ label, value, onChange, options }: Base & { options: string[] }) {
  return <label className="text-xs text-slate-500 block">{label}<select className={inputCls + " mt-1"} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select></label>;
}
export function Rating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (<div className="flex items-center justify-between gap-2 py-1 border-b last:border-0"><span className="text-sm">{label}</span><div className="flex gap-1" dir="ltr">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => onChange(n)} className={"w-8 h-8 rounded-full text-sm border " + (value >= n ? "bg-brand-500 text-white border-brand-500" : "bg-white text-slate-400")}>{n}</button>)}</div></div>);
}
