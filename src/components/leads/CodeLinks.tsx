"use client";
// CodeLinks.tsx (src/components/leads/CodeLinks.tsx) · updated 21.10.2026 11:45 (Asia/Jerusalem) — shows every family a code belongs to · created 11:35 — 📎 READY-TO-SEND COMPARISON LINKS: finds competitor codes (Dow / XIAMETER / Wacker / Momentive / Shin-Etsu / Evonik / Elkem) and Silitex names in the lead (competitor field, recommended SKU, use, website-scan result) → the matching public page on www.sapirim.com (code page or family comparison page). Copy or send on WhatsApp to the contact in one tap.
import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { P_CODES } from "@/portal/codes";
import { P_FAMILIES } from "@/portal/data";
import { PORTAL_URL } from "@/portal/config";
import type { Lead } from "@/lib/types";
import { useLang } from "@/i18n";
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "[\\s-]*");
const hit = (text: string, word: string) => new RegExp("(^|[^A-Za-z0-9])" + esc(word) + "($|[^A-Za-z0-9])", "i").test(text);
const waNum = (p?: string) => { const d = (p || "").replace(/\D/g, ""); return d ? (d.startsWith("0") ? "972" + d.slice(1) : d) : ""; };
export default function CodeLinks({ lead }: { lead: Lead }) {
  const { t: tr } = useLang(); const [copied, setCopied] = useState("");
  const links = useMemo(() => {
    const scan = (lead.intake as Record<string, unknown> | undefined)?.scan_json;
    const text = [lead.competitor_offset, lead.recommended_sku, lead.use_case, lead.product_match, typeof scan === "string" ? scan : JSON.stringify(scan || "")].filter(Boolean).join(" \n ");
    const out: { label: string; sub: string; url: string }[] = []; const seen = new Set<string>();
    for (const c of P_CODES) if (c.code.length >= 5 && hit(text, c.code) && !seen.has("c" + c.slug)) { seen.add("c" + c.slug); out.push({ label: c.code + " → Silitex", sub: c.producer + " · " + c.families.map((ff) => ff.family).join(" / "), url: PORTAL_URL + "/he/codes/" + c.slug }); }
    for (const f of P_FAMILIES) if (!seen.has("f" + f.slug) && f.silitexNames.some((n) => n.length >= 5 && hit(text, n))) { seen.add("f" + f.slug); out.push({ label: f.family, sub: tr("טבלת השוואה מלאה") + " · " + f.silitexNames.slice(0, 3).join(" / "), url: PORTAL_URL + "/he/alternatives/" + f.slug }); }
    return out.slice(0, 8);
  }, [lead, tr]);
  if (!links.length) return null;
  const phone = waNum(lead.contact_phone);
  const msg = (u: string) => (lead.contact_name ? "שלום " + lead.contact_name.split(/[—-]/)[0].trim() + ", " : "שלום, ") + "מצרף השוואה טכנית לחלופה מבית Silitex (לבדיקה במעבדה שלכם, אפשר לקבל דוגמה): " + u + "\nאבשי ספיר · 050-5231042";
  const copy = (u: string) => { navigator.clipboard?.writeText(msg(u)).then(() => { setCopied(u); setTimeout(() => setCopied(""), 2000); }).catch(() => {}); };
  return (
    <Card className="space-y-2">
      <h3 className="font-bold">📎 {tr("קישורי השוואה מוכנים לשליחה")}</h3>
      <ul className="space-y-1">{links.map((x) => (
        <li key={x.url} className="rounded-lg border p-2 text-sm space-y-1">
          <div className="font-medium" dir="ltr">{x.label}</div><div className="text-[11px] text-slate-500" dir="ltr">{x.sub}</div>
          <div className="flex flex-wrap gap-1">
            <a href={x.url} target="_blank" rel="noreferrer" className="px-2 py-1 rounded border bg-white text-xs">👁️ {tr("צפה")}</a>
            <button onClick={() => copy(x.url)} className="px-2 py-1 rounded border bg-white text-xs">{copied === x.url ? "✓ " + tr("הועתק") : "📋 " + tr("העתק הודעה")}</button>
            <a href={"https://wa.me/" + phone + "?text=" + encodeURIComponent(msg(x.url))} target="_blank" rel="noreferrer" className="px-2 py-1 rounded bg-emerald-600 text-white text-xs">💬 WhatsApp{phone ? "" : " (" + tr("בחר איש קשר") + ")"}</a>
          </div>
        </li>))}</ul>
    </Card>
  );
}
