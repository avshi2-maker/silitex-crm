"use client";
// QuickBriefPanel.tsx (src/components/brief/QuickBriefPanel.tsx) · updated 10.11.2026 14:45 (Asia/Jerusalem) — v1.9.9 📁 also searches projects (#SPR number, customer, description, product codes, PO / invoice) · on /projects an empty box lists the open projects · customer rows show their open project · 23.10.2026 08:45 — Silitex calling (name / their phone digits) → 🇮🇹 Silitex agenda card · created 08:30 — the 📞 quick-brief modal: search box (name HE/EN, phone digits, website, contact name) → up to 8 hits → the customer card (QuickBriefCard). Loads the store on open.
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useProjects } from "@/lib/use-projects";
import { refLabel } from "@/lib/projects";
import { ENDED } from "@/config/projects";
import ProjectHits, { projectHits } from "./ProjectHits";
import { useStore } from "@/lib/store";
import { useLang } from "@/i18n";
import { inputCls } from "@/components/ui";
import type { Lead } from "@/lib/types";
import QuickBriefCard from "./QuickBriefCard";
import SilitexBriefCard from "./SilitexBriefCard";

const norm = (s?: string) => String(s || "").toLowerCase().replace(/[^a-z0-9֐-׿]+/g, "");
const digits = (s?: string) => String(s || "").replace(/\D/g, "").replace(/^972/, "0");

function hits(leads: Lead[], q: string): Lead[] {
  const n = norm(q), d = digits(q); if (!n && d.length < 4) return [];
  const score = (l: Lead) => {
    const name = norm(l.name);
    if (d.length >= 6 && [l.contact_phone, l.intake?.phone as string | undefined].some((p) => digits(p).endsWith(d.slice(-9)))) return 100;
    if (name.startsWith(n)) return 90; if (name.includes(n)) return 70;
    if (norm(l.contact_name).includes(n) || norm(l.website).includes(n)) return 50;
    if (n.length >= 4 && norm(l.sub_industry).includes(n)) return 20; return 0;
  };
  return leads.map((l) => ({ l, s: score(l) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.l.name.localeCompare(b.l.name)).slice(0, 8).map((x) => x.l);
}

export default function QuickBriefPanel({ onClose }: { onClose: () => void }) {
  const { t: tr } = useLang(); const store = useStore();
  const [q, setQ] = useState(""); const [sel, setSel] = useState<string>("");
  const list = useMemo(() => hits(store.state.leads, q), [store.state.leads, q]);
  const lead = store.state.leads.find((l) => l.id === sel);
  const onTab = (usePathname() || "").startsWith("/projects"); const prj = useProjects({ lite: true });
  const pHits = useMemo(() => projectHits(prj.list || [], q, onTab), [prj.list, q, onTab]);
  const openPrj = (id: string) => (prj.list || []).find((p) => p.lead_id === id && !ENDED.includes(p.stage));
  // Silitex calling? name / company / their phone digits → the Silitex agenda card
  const d = digits(q); const nq = norm(q);
  const silitexHit = (!!nq && /silitex|federica|eleonora|biti|pravato|סיליטקס|פדריקה|אלאונורה|איטליה/.test(q.toLowerCase())) || (d.length >= 6 && store.state.contacts.some((c) => [c.phone, c.mobile].some((p) => digits(p).endsWith(d.slice(-9)))));
  const who = /eleonora|pravato|אלאונורה/i.test(q) ? "eleonora" : /federica|biti|פדריקה/i.test(q) ? "federica" : "";
  return (
    <div className="fixed inset-0 z-[9990] bg-black/40 flex items-start justify-center p-3 md:p-10 print:hidden" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2"><span className="text-xl">📞</span><input autoFocus className={inputCls} placeholder={tr(onTab ? "#SPR / לקוח / מוצר / PO / חשבונית…" : "שם חברה / איש קשר / טלפון / אתר / #SPR…")} value={q} onChange={(e) => { setQ(e.target.value); setSel(""); }} /><button className="text-slate-500 px-2 text-lg" onClick={onClose}>✕</button></div>
        {!store.ready ? null : sel === "__silitex" ? (
          <SilitexBriefCard store={store} who={who} onBack={() => setSel("")} onClose={onClose} />
        ) : !lead ? (
          <div className="space-y-1">
            {silitexHit && <button className="w-full text-start border-2 border-brand-500 rounded-lg px-3 py-2 hover:bg-brand-50" onClick={() => setSel("__silitex")}><div className="font-bold">🇮🇹 Silitex — Federica / Eleonora</div><div className="text-xs text-slate-500">{tr("סדר יום לשיחה: מה פתוח אצלם, מה אצלנו, החדשות שלנו")}</div></button>}
            <ProjectHits hits={pHits} onClose={onClose} />
            {pHits.length > 0 && list.length > 0 && <div className="text-xs font-semibold text-slate-500 pt-1">🏭 {tr("לקוחות")}</div>}
            {list.map((l) => (
              <button key={l.id} className="w-full text-start border rounded-lg px-3 py-2 hover:bg-brand-50" onClick={() => setSel(l.id)}>
                <div className="font-medium" dir="auto">{l.name}</div>
                <div className="text-xs text-slate-500" dir="auto">{l.industry}{l.contact_name ? " · " + l.contact_name : ""}{l.contact_phone ? " · " + l.contact_phone : ""}{openPrj(l.id) ? <span dir="ltr" className="ms-2 font-mono text-sky-800">📁 {refLabel(openPrj(l.id)!)}</span> : null}</div>
              </button>
            ))}
            {q && !list.length && !pHits.length && !silitexHit && <div className="text-sm text-slate-500">{tr("לא נמצא — נסה חלק מהשם או 4 ספרות מהטלפון")}</div>}
            {!q && <div className="text-xs text-slate-500">{tr("טלפון נכנס? הקלד את הספרות האחרונות. Ctrl+K פותח/סוגר מכל מסך.")}</div>}
          </div>
        ) : (
          <QuickBriefCard lead={lead} store={store} onBack={() => setSel("")} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
