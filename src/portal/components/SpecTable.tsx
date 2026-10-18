// SpecTable.tsx (src/portal/components/SpecTable.tsx) · updated 18.10.2026 18:00 (Asia/Jerusalem) — technical data table for a catalogue product (tables are what AI answers quote)
import type { CatRow } from "@/lib/catalog";
import type { PLang } from "../config";
import { pt } from "../i18n";
export default function SpecTable({ p, lang }: { p: CatRow; lang: PLang }) {
  const t = (k: string) => pt(lang, k);
  const rows: [string, string][] = [[t("sector"), p.sector], [t("section"), p.section], ["Code", p.code], [t("inci"), p.inci], [t("type"), p.type], [t("active"), p.active_pct ? p.active_pct + " %" : ""], [t("application"), p.application], [t("dosage"), p.dosage], [t("compliance"), p.compliance]].filter(([, v]) => v) as [string, string][];
  return (
    <table className="w-full text-sm border rounded-xl overflow-hidden" dir="ltr">
      <tbody>{rows.map(([k, v]) => <tr key={k} className="border-t first:border-t-0"><th className="text-left align-top bg-slate-50 p-2 w-48 font-medium" dir="auto">{k}</th><td className="p-2">{v}</td></tr>)}</tbody>
    </table>
  );
}
