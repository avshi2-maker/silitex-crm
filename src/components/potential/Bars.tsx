"use client";
// Bars.tsx (src/components/potential/Bars.tsx) · created 22.10.2026 08:05 (Asia/Jerusalem) — light horizontal bar chart (no library): label · main bar · optional lighter "of total" bar · value text.
type Item = { label: string; value: number; total?: number; note?: string };
export default function Bars({ items, unit = "", max }: { items: Item[]; unit?: string; max?: number }) {
  const m = max || Math.max(1, ...items.map((i) => Math.max(i.value, i.total || 0)));
  return (
    <div className="space-y-1.5">{items.map((i) => (
      <div key={i.label} className="grid grid-cols-[minmax(110px,32%)_1fr_auto] items-center gap-2 text-xs">
        <div className="truncate text-slate-600" title={i.label}>{i.label}</div>
        <div className="relative h-4 rounded bg-slate-100 overflow-hidden" dir="ltr">
          {i.total !== undefined && <div className="absolute inset-y-0 left-0 bg-brand-100" style={{ width: (100 * i.total) / m + "%" }} />}
          <div className="absolute inset-y-0 left-0 bg-brand-500 rounded" style={{ width: Math.max(i.value > 0 ? 2 : 0, (100 * i.value) / m) + "%" }} />
        </div>
        <div className="tabular-nums text-slate-700 whitespace-nowrap" dir="ltr">{Math.round(i.value * 10) / 10}{unit}{i.total !== undefined ? " / " + Math.round(i.total * 10) / 10 + unit : ""}{i.note ? " · " + i.note : ""}</div>
      </div>))}</div>
  );
}
