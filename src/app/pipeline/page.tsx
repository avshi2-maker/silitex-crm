"use client";
// page.tsx (src/app/pipeline/page.tsx) · updated 09.10.2026 10:30 (Asia/Jerusalem) — kanban by stage
import Link from "next/link";
import { useStore, STAGES } from "@/lib/store";
import { H1 } from "@/components/ui";
import { fmtUsd } from "@/lib/format";
import type { Stage } from "@/lib/types";
import { useLang } from "@/i18n";
export default function PipelinePage() {
  const { t: tr } = useLang();
  const { state, ready, setStage } = useStore();
  if (!ready) return null;
  return (
    <div className="space-y-4">
      <H1 sub={tr("גרור לקוח בין שלבים (או השתמש בחצים)")}>{tr("צנרת מכירות")}</H1>
      <div className="grid grid-cols-7 gap-2 min-w-[1100px]">
        {STAGES.map((s, si) => {
          const items = state.leads.filter((l) => l.stage === s.key);
          const sum = items.reduce((a, l) => a + l.value_usd, 0);
          return (
            <div key={s.key} className="bg-slate-50 border rounded-xl p-2 min-h-[300px]" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const id = e.dataTransfer.getData("id"); if (id) setStage(id, s.key as Stage); }}>
              <div className="font-bold text-sm">{tr(s.he)} <span className="text-slate-400 font-normal">({items.length})</span></div>
              <div className="text-xs text-slate-500 mb-2">{fmtUsd(sum)}</div>
              {items.map((l) => (
                <div key={l.id} draggable onDragStart={(e) => e.dataTransfer.setData("id", l.id)} className="bg-white border rounded-lg p-2 mb-2 text-xs cursor-grab">
                  <Link href={"/leads/" + l.id} className="font-medium text-brand-700 hover:underline">{l.name}</Link>
                  <div className="text-slate-500">{fmtUsd(l.value_usd)}</div>
                  <div className="flex justify-between mt-1 text-slate-400">
                    <button onClick={() => si < STAGES.length - 1 && setStage(l.id, STAGES[si + 1].key)} title={tr("קדם")}>←</button>
                    <button onClick={() => si > 0 && setStage(l.id, STAGES[si - 1].key)} title={tr("החזר")}>→</button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
