// ReachNote.tsx (src/components/ReachNote.tsx) · updated 09.10.2026 16:50 (Asia/Jerusalem) — regulatory banner: D4/D5 (cyclic siloxanes) under REACH and the Silitex replacements. Shown on /products and /offsets.
import Link from "next/link";
export default function ReachNote() {
  return (
    <div className="border border-amber-300 bg-amber-50 rounded-xl p-4 text-sm" dir="ltr">
      <div className="font-bold text-amber-900">⚠ REACH — cyclic siloxanes (D4 / D5 / D6)</div>
      <p className="text-amber-900/90 mt-1">D4 (octamethylcyclotetrasiloxane) is PBT/vPvB and reprotoxic; D4/D5/D6 are restricted under REACH Annex XVII. Legacy silicone softeners and emulsions often still use cyclic carriers. Silitex replacements:</p>
      <ul className="list-disc list-inside mt-1 text-amber-900/90">
        <li><b>Non-cyclic amino emulsions</b> — MACROAMISIL (E1386), MICROAMISIL (E1352), IDROAMISIL 250 (E1453)</li>
        <li><b>Linear PDMS carriers</b> — Silitex DM fluids (5–5,000 cSt), EVERSIL emulsions, gels on dimethicone crosspolymer</li>
        <li><b>Silicone-free / bio-based</b> — FISIOREX 1000, EVEROIL 35 / EVERIX 35</li>
      </ul>
      <p className="text-xs text-amber-800 mt-2">Products with a cyclic carrier (e.g. CM 040 / Volatile D5 fluid, cosmetics) are flagged in the catalog. Always verify SDS §3 (constituents, CAS, impurity %; D4 < 0.1%). If challenged: acknowledge the legacy SKU → point to SDS §3 → pivot to the non-cyclic / vegetal upgrade. <Link href="/faq" className="underline">Q&A 22, 42</Link></p>
    </div>
  );
}
