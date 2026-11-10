"use client";
// ProjectHits.tsx (src/components/brief/ProjectHits.tsx) · created 10.11.2026 14:40 (Asia/Jerusalem) — v1.9.9 📁 projects in the 📞 Ctrl+K search
// Finds by number (SPR-0002 / #2 / 0002), customer, description, request (product codes), quote / PO / invoice numbers → click = the project card.
// Empty box on /projects → the open projects, newest first.
import Link from "next/link";
import { Badge } from "@/components/ui";
import { refLabel, stageText } from "@/lib/projects";
import { ENDED } from "@/config/projects";
import { useLang } from "@/i18n";
import type { Project } from "@/lib/types";

const norm = (s?: string | null) => String(s || "").toLowerCase().replace(/[^a-z0-9֐-׿]+/g, "");
export function projectHits(list: Project[], q: string, onTab: boolean): Project[] {
  const n = norm(q); const num = /^#?\s*(?:spr\s*-?\s*)?0*(\d{1,4})$/i.exec(q.trim())?.[1];
  if (!n) return onTab ? list.filter((p) => !ENDED.includes(p.stage)).slice(0, 8) : [];
  const score = (p: Project) => {
    if (num && Number(p.id.slice(4)) === Number(num)) return 100;
    if (norm(p.id).includes(n)) return 95;
    if ([p.po_sample, p.po_product, p.invoice, p.quote_ref].some((x) => x && norm(x).includes(n))) return 85;
    if (norm(p.lead_name).includes(n)) return 70;
    if (n.length >= 3 && (norm(p.description).includes(n) || norm(p.request).includes(n))) return 50;
    return 0;
  };
  return list.map((p) => ({ p, s: score(p) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || b.p.opened_at.localeCompare(a.p.opened_at)).slice(0, 6).map((x) => x.p);
}
export default function ProjectHits({ hits, onClose }: { hits: Project[]; onClose: () => void }) {
  const { t: tr } = useLang(); if (!hits.length) return null;
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-slate-500">📁 {tr("פרויקטים")}</div>
      {hits.map((p) => (
        <Link key={p.id} href={"/projects/" + p.id} onClick={onClose} className="flex flex-wrap items-center gap-2 border border-sky-200 rounded-lg px-3 py-2 hover:bg-sky-50">
          <span dir="ltr" className="font-mono text-xs font-bold bg-ink-900 text-white rounded px-2 py-1">{refLabel(p)}</span>
          <span className="font-medium" dir="auto">{p.lead_name}</span>
          <Badge tone={ENDED.includes(p.stage) ? "slate" : "amber"}>{tr(stageText(p.stage))}</Badge>
          <span className="text-xs text-slate-500 w-full truncate" dir="auto">{p.description || p.request}</span>
        </Link>))}
    </div>
  );
}
