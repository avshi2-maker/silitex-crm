"use client";
// FirewallBadge.tsx (src/components/FirewallBadge.tsx) · created 09.11.2026 05:40 (Asia/Jerusalem)
// 🛡️ Header badge: this site is protected by the Vercel Firewall (audited 09/11/2026). Hover = the active rules.
const RULES = "• Rate limit — PIN login (403)\n• Rate limit — public AI box (403)\n• Rate limit — lead forms (429)";
export default function FirewallBadge({ dark = false }: { dark?: boolean }) {
  return (
    <span title={"🛡️ Vercel Firewall פעיל (נבדק 09/11/2026)\n" + RULES} className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border " + (dark ? "border-emerald-300/60 text-emerald-100 bg-white/10" : "border-emerald-500 text-emerald-700 bg-emerald-50")}>
      <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
      🛡️ מוגן
    </span>
  );
}
