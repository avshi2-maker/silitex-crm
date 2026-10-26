"use client";
// ComboInput.tsx (src/components/ComboInput.tsx) · created 26.10.2026 06:55 (Asia/Jerusalem) — v0.96.1
// Text box + ▼ that ALWAYS opens the full list (the browser's datalist hid every option once a value was typed).
// Free text still allowed; typing filters the open list; click outside closes.
import { useEffect, useRef, useState } from "react";
import { inputCls } from "./ui";
type Props = { label: string; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string; className?: string };
export default function ComboInput({ label, value, options, onChange, placeholder, className }: Props) {
  const [open, setOpen] = useState(false); const [typed, setTyped] = useState(false); const box = useRef<HTMLLabelElement>(null);
  useEffect(() => { const off = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", off); return () => document.removeEventListener("mousedown", off); }, []);
  const q = (value || "").toLowerCase(); const list = typed && q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  const btn = "absolute inset-y-0 end-0 px-2 text-slate-500 hover:text-brand-600";
  return (
    <label ref={box} className="text-xs text-slate-500 relative block">{label}
      <span className="relative block mt-1">
        <input className={(className || inputCls) + " pe-8"} value={value || ""} placeholder={placeholder} onFocus={() => { setTyped(false); setOpen(true); }} onChange={(e) => { onChange(e.target.value); setTyped(true); setOpen(true); }} onKeyDown={(e) => { if (e.key === "Escape" || e.key === "Enter") setOpen(false); }} />
        <button type="button" tabIndex={-1} className={btn} onClick={() => { setTyped(false); setOpen(!open); }} aria-label="▼">▾</button>
      </span>
      {open && list.length > 0 && (
        <div className="absolute z-30 mt-1 w-full max-h-64 overflow-auto bg-white border rounded-lg shadow-lg text-sm text-slate-800">
          {list.map((o) => <button type="button" key={o} className={"block w-full text-start px-3 py-1.5 hover:bg-brand-50 " + (o === value ? "bg-brand-50 font-bold" : "")} onMouseDown={(e) => { e.preventDefault(); onChange(o); setOpen(false); }}>{o}</button>)}
        </div>)}
    </label>
  );
}
