"use client";
// OrderSteps.tsx (src/components/orders/OrderSteps.tsx) · created 16.11.2026 17:30 (Asia/Jerusalem) — v1.13.0 📦 order stepper (sample 8 steps / product 9), click a step to move the order there
import { stagesOf, stageNo } from "@/config/orders";
import { useLang } from "@/i18n";
import type { Order } from "@/lib/types";
export default function OrderSteps({ o, onStage }: { o: Order; onStage: (s: string) => void }) {
  const { t: tr } = useLang(); const cur = stageNo(o.kind, o.stage);
  return (
    <ol className="grid gap-2 grid-cols-2 md:grid-cols-4 xl:grid-cols-9 text-xs">
      {stagesOf(o.kind).map((s, i) => (
        <li key={s.id}><button onClick={() => onStage(s.id)} className={"w-full text-start rounded-lg border p-2 min-h-[64px] " + (i === cur ? "bg-amber-50 border-amber-400 ring-2 ring-amber-300" : i < cur ? "bg-emerald-50 border-emerald-200" : "bg-white")}>
          <div className="font-bold">{i + 1} · {s.icon} {tr(s.he)}</div><div className="text-slate-500">{tr(s.hint)}</div>
        </button></li>
      ))}
    </ol>
  );
}
