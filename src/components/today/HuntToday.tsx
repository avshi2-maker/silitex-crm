"use client";
// HuntToday.tsx (src/components/today/HuntToday.tsx) · updated 21.10.2026 11:45 (Asia/Jerusalem) — rotates inside A+B first (then A–C) so the best accounts come first · created 11:30 — 🎯 DAILY HUNT on "My day": 5 open leads without a contact person, best priority first (A/B/C/D score), rotating every day so the whole list gets covered. Each row: 👤 LinkedIn key people · ✅ is the company real · open the card (🔎 smart search → save contact). A lead leaves the list the moment a contact is saved. Weekly counter of contacts found.
import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { scoreLead } from "@/lib/priority";
import { leadQueries, g } from "@/lib/google-tricks";
import { isClosed } from "@/config/stages";
import type { Lead, Task, Activity } from "@/lib/types";
import { useLang } from "@/i18n";
const PER_DAY = 5;
const TONE: Record<string, string> = { A: "green", B: "blue", C: "amber", D: "slate" };
export default function HuntToday({ leads, tasks, activities }: { leads: Lead[]; tasks: Task[]; activities: Activity[] }) {
  const { t: tr } = useLang();
  const pool = leads.filter((l) => !l.contact_name && !isClosed(l.stage) && l.status !== "lost").map((l) => ({ l, s: scoreLead(l, tasks) })).sort((a, b) => b.s.total - a.s.total);
  if (!pool.length) return null;
  // rotate inside the best grades first: A+B (if at least 5), else A–C, else everyone
  const ab = pool.filter((x) => x.s.grade === "A" || x.s.grade === "B"); const abc = pool.filter((x) => x.s.grade !== "D");
  const cand = ab.length >= PER_DAY ? ab : abc.length >= PER_DAY ? abc : pool;
  const day = Math.floor(Date.now() / 864e5); const start = (day * PER_DAY) % cand.length;
  const pick = [...cand.slice(start), ...cand.slice(0, start)].slice(0, PER_DAY);
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const found = activities.filter((a) => a.at >= weekAgo && a.text.includes(tr("איש קשר נמצא בחיפוש"))).length;
  return (
    <Card className="space-y-2 border-2 border-amber-300">
      <div className="flex flex-wrap items-center gap-2"><h2 className="font-bold flex-1">🎯 {tr("ציד יומי — 5 לידים בלי איש קשר")}</h2><Badge tone="amber">{pool.length} {tr("בלי איש קשר")}</Badge><Badge tone="green">{found} {tr("נמצאו השבוע")}</Badge></div>
      <ul className="divide-y">{pick.map(({ l, s }) => { const q = leadQueries(l); return (
        <li key={l.id} className="py-2 flex flex-wrap items-center gap-2 text-sm">
          <Badge tone={TONE[s.grade]}>{s.grade}</Badge>
          <Link href={"/leads/" + l.id} className="font-medium hover:underline flex-1 min-w-[10rem]">{l.name} <span className="text-xs text-slate-500">· {tr(l.industry)}</span></Link>
          <a href={g(q[0].q)} target="_blank" rel="noreferrer" className="px-2 py-1 rounded-lg border bg-white text-xs hover:border-brand-400">👤 {tr("אנשי מפתח")} ↗</a>
          <a href={g(q[2].q)} target="_blank" rel="noreferrer" className="px-2 py-1 rounded-lg border bg-white text-xs hover:border-brand-400">✅ {tr("אימות")} ↗</a>
          <Link href={"/leads/" + l.id} className="px-2 py-1 rounded-lg bg-brand-500 text-white text-xs">💾 {tr("פתח ושמור")}</Link>
        </li>); })}</ul>
      <div className="text-[11px] text-slate-500">{tr("מצאתם מישהו? בכרטיס הלקוח → 🔎 חיפוש חכם → \"מצאתי מישהו\" → הליד יורד מהרשימה. מחר — 5 חדשים.")}</div>
    </Card>
  );
}
