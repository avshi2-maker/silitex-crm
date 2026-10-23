"use client";
// TrustChips.tsx (src/components/leads/TrustChips.tsx) · created 23.10.2026 16:10 (Asia/Jerusalem) — 📎 source + confidence chips: which AI tools found the customer + ✅/🟡/⚠/📝 trust badge (hover = why). compact = list row (badge only).
import type { Lead } from "@/lib/types";
import { useLang } from "@/i18n";
import { Badge } from "@/components/ui";
import { trustOf, TRUST_UI } from "@/lib/lead-trust";

export default function TrustChips({ lead, compact }: { lead: Lead; compact?: boolean }) {
  const { t: tr } = useLang(); const t = trustOf(lead); const ui = TRUST_UI[t.level];
  if (compact) return t.level === "manual" ? null : <span title={tr(t.why) + (t.tools.length ? " · " + t.tools.join(" + ") : "")} className="ms-1 text-[11px]">{ui.icon}{t.tools.length > 1 ? "×" + t.tools.length : ""}</span>;
  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {t.tools.map((x) => <Badge key={x} tone="blue">📎 {x}</Badge>)}
      <span title={tr(t.why)}><Badge tone={ui.tone}>{ui.icon} {tr(ui.he)}</Badge></span>
      {t.level !== "manual" && <span className="text-[11px] text-slate-500">{tr(t.why)}</span>}
    </div>
  );
}
