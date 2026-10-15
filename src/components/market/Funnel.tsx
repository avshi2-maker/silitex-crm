"use client";
// Funnel.tsx (src/components/market/Funnel.tsx) · updated 15.10.2026 14:45 (Asia/Jerusalem) — live stage (pilot / rd_approved / rfq… / won) overrides plan stage · market-development funnel: accounts by plan stage (R&D outreach → lab qualification → pilot → purchasing → contract)
import Link from "next/link";
import { Badge } from "@/components/ui";
import { useLang } from "@/i18n";
import type { Lead } from "@/lib/types";
export const STAGES: { key: string; match: RegExp; he: string; icon: string; who: string }[] = [
  { key: "1", match: /^1\./, he: "פנייה למו\"פ", icon: "🔬", who: "R&D / Formulation" },
  { key: "2", match: /^2\./, he: "הסמכה במעבדה", icon: "🧪", who: "Lab / QC" },
  { key: "3", match: /^3\./, he: "פיילוט תעשייתי", icon: "🏭", who: "Plant / Operations" },
  { key: "4", match: /^4\./, he: "משא ומתן ברכש", icon: "🤝", who: "Purchasing" },
  { key: "5", match: /^5\.|won/i, he: "חוזה שנתי", icon: "📜", who: "Management" },
];
// live CRM stage overrides the static plan once the account has moved past sampling
const LIVE: Record<string, string> = { pilot: "3", rd_approved: "4", rfq: "4", quote: "4", negotiation: "4", won: "5" };
export const stageOf = (l: Lead) => (LIVE[l.stage] && STAGES.find((s) => s.key === LIVE[l.stage])) || STAGES.find((s) => s.match.test(l.plan_stage || "")) || STAGES[0];
export default function Funnel({ leads, sel, onSel }: { leads: Lead[]; sel: string; onSel: (id: string) => void }) {
  const { t: tr } = useLang();
  return (
    <div className="grid md:grid-cols-5 gap-2">
      {STAGES.map((s, i) => { const items = leads.filter((l) => stageOf(l).key === s.key).sort((a, b) => a.name.localeCompare(b.name)); const usd = items.reduce((a, l) => a + l.value_usd, 0); return (
        <div key={s.key} className="border rounded-xl bg-white p-2 min-h-[160px]">
          <div className="flex items-center justify-between"><div className="font-bold text-sm">{s.icon} {i + 1}. {tr(s.he)}</div><Badge tone={items.length ? "blue" : "slate"}>{items.length}</Badge></div>
          <div className="text-[11px] text-slate-400" dir="ltr">{s.who} · ${(usd / 1000).toFixed(0)}k Yr1</div>
          <ul className="mt-2 space-y-1 text-xs">{items.map((l) => (<li key={l.id}><button onClick={() => onSel(l.id)} className={"w-full text-start px-2 py-1 rounded-lg border " + (sel === l.id ? "bg-brand-50 border-brand-300" : "hover:bg-slate-50")}>{l.name.split(" (")[0]}<span className="text-slate-400"> · {l.volume_tons} t</span></button></li>))}</ul>
          {i < 4 && <div className="text-[10px] text-slate-400 mt-2">{tr("יוצא כשיש:")} {tr(["אישור טכני ממו\"פ", "תוצאות מעבדה חיוביות", "פיילוט מאושר בקו", "חתימת רכש", ""][i])}</div>}
          {items.length === 0 && <div className="text-xs text-slate-300 mt-2">—</div>}
          {s.key === "5" && <Link href="/pipeline" className="text-[11px] text-brand-600 underline">{tr("צנרת מכירות")} →</Link>}
        </div>); })}
    </div>
  );
}
