"use client";
// page.tsx (src/app/schedule/page.tsx) · updated 09.10.2026 09:10 (Asia/Jerusalem) — daily / weekly cadence engine
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, H1, Badge, btnPrimary } from "@/components/ui";
import { fmtDate, todayIso, addDays } from "@/lib/format";
import ExportBar from "@/components/ExportBar";
export default function SchedulePage() {
  const { state, ready, generateSchedule, toggleTask } = useStore();
  if (!ready) return null;
  const today = todayIso();
  const groups = [
    { he: "באיחור", items: state.tasks.filter((t) => !t.done && t.due < today) },
    { he: "היום " + fmtDate(today), items: state.tasks.filter((t) => !t.done && t.due === today) },
    { he: "השבוע", items: state.tasks.filter((t) => !t.done && t.due > today && t.due <= addDays(today, 7)) },
    { he: "בוצע", items: state.tasks.filter((t) => t.done).slice(0, 20) },
  ];
  const text = groups.slice(0, 3).map((g) => g.he + ":\n" + g.items.map((t) => "  • " + fmtDate(t.due) + " " + t.lead_name + " — " + t.title).join("\n")).join("\n\n");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><H1 sub="כל לקוח פעיל מקבל משימה יומית לפי השלב שלו + סקירה שבועית">יומן יומי / שבועי</H1><button className={btnPrimary} onClick={generateSchedule}>⚙️ צור משימות להיום + השבוע</button></div>
      {groups.map((g) => (
        <Card key={g.he}>
          <h3 className="font-bold mb-2">{g.he} <span className="text-slate-400 font-normal">({g.items.length})</span></h3>
          {g.items.length === 0 && <p className="text-sm text-slate-400">—</p>}
          <ul className="space-y-1 text-sm">{g.items.map((t) => (<li key={t.id} className="flex items-center gap-2"><input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} /><Badge tone={t.cadence === "weekly" ? "amber" : t.cadence === "daily" ? "blue" : "slate"}>{t.cadence === "weekly" ? "שבועי" : t.cadence === "daily" ? "יומי" : "חד-פעמי"}</Badge><span className="text-slate-500 w-20">{fmtDate(t.due)}</span><Link href={"/leads/" + t.lead_id} className="font-medium text-brand-700 hover:underline">{t.lead_name}</Link><span className={t.done ? "line-through text-slate-400" : ""}>{t.title}</span></li>))}</ul>
        </Card>
      ))}
      <ExportBar title={"תוכנית עבודה " + fmtDate(today)} text={text} />
    </div>
  );
}
