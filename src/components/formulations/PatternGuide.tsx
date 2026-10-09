"use client";
// PatternGuide.tsx (src/components/formulations/PatternGuide.tsx) · updated 09.10.2026 18:20 (Asia/Jerusalem) — role × chemistry × Silitex table + product-type map + silicone-in-water pattern
import { ROLES, PRODUCT_TYPES, SIW_PATTERN } from "@/config/patterns";
import { Badge } from "@/components/ui";
export default function PatternGuide() {
  const th = "p-2 text-left text-xs";
  return (
    <div className="space-y-4" dir="ltr">
      <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50"><tr><th className={th}>Silicone role</th><th className={th}>Typical chemistry</th><th className={th}>Silitex</th><th className={th}>D4/D5-free route</th></tr></thead>
        <tbody>{ROLES.map((r) => (<tr key={r.role} className="border-t"><td className="p-2 font-medium">{r.role}</td><td className="p-2 text-slate-600">{r.chem}</td><td className="p-2 text-brand-700">{r.silitex}</td><td className="p-2"><Badge tone="green">{r.d5free}</Badge></td></tr>))}</tbody></table></div>
      <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50"><tr><th className={th}>Product type</th><th className={th}>Silicone-fluid role</th><th className={th}>Chemistry</th><th className={th}>Silitex building blocks</th></tr></thead>
        <tbody>{PRODUCT_TYPES.map((p) => (<tr key={p.type} className="border-t"><td className="p-2 font-medium">{p.type}</td><td className="p-2 text-slate-600">{p.role}</td><td className="p-2 text-slate-600">{p.chem}</td><td className="p-2 text-brand-700">{p.silitex}</td></tr>))}</tbody></table></div>
      <div><div className="font-bold text-sm mb-1">Silicone-in-water emulsion — process pattern</div><ol className="list-decimal list-inside text-sm space-y-0.5">{SIW_PATTERN.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
      <p className="text-xs text-slate-500">Pattern reference: supplier personal-care guides (KCC, NuSil CareSil). Guide formulations only — adapt and evaluate before use; Silitex blocks are catalog cross-references.</p>
    </div>
  );
}
