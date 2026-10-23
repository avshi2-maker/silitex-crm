"use client";
// QuickBriefPanel.tsx (src/components/brief/QuickBriefPanel.tsx) · created 23.10.2026 08:30 (Asia/Jerusalem) — the 📞 quick-brief modal: search box (name HE/EN, phone digits, website, contact name) → up to 8 hits → the customer card (QuickBriefCard). Loads the store on open.
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useLang } from "@/i18n";
import { inputCls } from "@/components/ui";
import type { Lead } from "@/lib/types";
import QuickBriefCard from "./QuickBriefCard";

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
  return (
    <div className="fixed inset-0 z-[9990] bg-black/40 flex items-start justify-center p-3 md:p-10 print:hidden" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2"><span className="text-xl">📞</span><input autoFocus className={inputCls} placeholder={tr("שם חברה / איש קשר / טלפון / אתר…")} value={q} onChange={(e) => { setQ(e.target.value); setSel(""); }} /><button className="text-slate-500 px-2 text-lg" onClick={onClose}>✕</button></div>
        {!store.ready ? null : !lead ? (
          <div className="space-y-1">
            {list.map((l) => (
              <button key={l.id} className="w-full text-start border rounded-lg px-3 py-2 hover:bg-brand-50" onClick={() => setSel(l.id)}>
                <div className="font-medium" dir="auto">{l.name}</div>
                <div className="text-xs text-slate-500" dir="auto">{l.industry}{l.contact_name ? " · " + l.contact_name : ""}{l.contact_phone ? " · " + l.contact_phone : ""}</div>
              </button>
            ))}
            {q && !list.length && <div className="text-sm text-slate-500">{tr("לא נמצא — נסה חלק מהשם או 4 ספרות מהטלפון")}</div>}
            {!q && <div className="text-xs text-slate-500">{tr("טלפון נכנס? הקלד את הספרות האחרונות. Ctrl+K פותח/סוגר מכל מסך.")}</div>}
          </div>
        ) : (
          <QuickBriefCard lead={lead} store={store} onBack={() => setSel("")} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
