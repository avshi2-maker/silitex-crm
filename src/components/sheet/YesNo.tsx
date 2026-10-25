"use client";
// YesNo.tsx (src/components/sheet/YesNo.tsx) · created 25.10.2026 08:10 (Asia/Jerusalem) — tick box for the meeting sheet: on screen click כן / לא (saved on the customer, click again to clear); printed as ☐ כן ☐ לא with the chosen one ☒ — empty boxes stay free to tick by pen.
export default function YesNo({ v, onChange }: { v: string; onChange: (v: string) => void }) {
  const b = (val: string, he: string) => {
    const on = v === val;
    return <button type="button" aria-pressed={on} onClick={() => onChange(on ? "" : val)} className={"px-1.5 py-0.5 rounded border text-[11px] print:border-0 print:px-0 " + (on ? (val === "yes" ? "bg-emerald-600 text-white border-emerald-600 print:bg-transparent print:text-black" : "bg-slate-600 text-white border-slate-600 print:bg-transparent print:text-black") : "bg-white")} dir="rtl"><span>{on ? "☒" : "☐"}</span>{" "}<span>{he}</span></button>;
  };
  return <div className="flex flex-col gap-0.5 items-start">{b("yes", "כן")}{b("no", "לא")}</div>;
}
