"use client";
// HuntSharpen.tsx (src/components/hunt/HuntSharpen.tsx) · created 22.10.2026 18:00 (Asia/Jerusalem) — ✨ AI sharpen for the search-prompt builder: messy notes / pasted article → INDUSTRY (from the CRM list) + tight SUB + example SIMILAR companies + FOCUS; applied to the builder fields (↩ undo keeps the original). Runs through AiPanel → token + cost meter and the 5-button export bar.
import { useState } from "react";
import AiPanel from "@/components/AiPanel";
import { useLang } from "@/i18n";
import { btnGhost } from "@/components/ui";
import { INDUSTRY_LIST } from "@/config/industry-list";

export type HuntFields = { industry: string; sub: string; similar: string; notes: string };
export function parseSharpen(text: string): Partial<HuntFields> {
  const get = (k: string) => (text.match(new RegExp("^\\s*\\**" + k + "\\**\\s*:\\s*(.+)$", "im"))?.[1] || "").replace(/\*+/g, "").trim();
  const ind = get("INDUSTRY"); const hit = INDUSTRY_LIST.find((x) => x.toLowerCase() === ind.toLowerCase());
  const out: Partial<HuntFields> = {}; if (hit) out.industry = hit;
  const sub = get("SUB"), sim = get("SIMILAR"), focus = get("FOCUS");
  if (sub) out.sub = sub; if (sim && !/^(none|-|n\/a)$/i.test(sim)) out.similar = sim; if (focus) out.notes = focus;
  return out;
}

type Spend = { tokens: number; cost: number };
export default function HuntSharpen({ f, onApply, spend, addSpend }: { f: HuntFields; onApply: (p: Partial<HuntFields>) => void; spend: Spend; addSpend: (tokens: number, cost: number) => void }) {
  const { t: tr } = useLang();
  const [undo, setUndo] = useState<HuntFields | null>(null);
  const build = () => ({
    prompt: [
      "I distribute Silitex (Italy) silicone chemicals in Israel: antifoams, release agents, silicone fluids and emulsions, softeners, water repellents, additives. I am hunting NEW industrial customers.",
      "Turn my rough input into a precise search brief. Answer in ENGLISH, exactly these 4 lines and nothing else:",
      "INDUSTRY: <exactly one of: " + INDUSTRY_LIST.join(" | ") + ">",
      "SUB: <the sub-industry, max 8 words>",
      "SIMILAR: <2-5 example companies in Israel of this type that you are confident exist, comma-separated — or none>",
      "FOCUS: <2-4 sentences: which kinds of plants to target, which processes they run, where silicone is used — functions only, no product or brand names>",
      "",
      "My input:",
      "Industry: " + (f.industry || "-"), "Sub-industry: " + (f.sub || "-"), "Similar to: " + (f.similar || "-"), "Notes / text I read:\n" + (f.notes || "-"),
    ].join("\n"),
  });
  const apply = (text: string) => { const p = parseSharpen(text); if (!Object.keys(p).length) return; setUndo({ ...f }); onApply(p); };
  return (
    <div className="space-y-2">
      <AiPanel title={tr("✨ חידוד החיפוש עם AI")} buttonLabel={tr("חדד")} lang="any" buildPrompt={build} onResult={apply} sessionTokens={spend.tokens} sessionCost={spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)} />
      {undo && <button className={btnGhost} onClick={() => { onApply(undo); setUndo(null); }}>↩ {tr("בטל — החזר את מה שכתבתי")}</button>}
    </div>
  );
}
