"use client";
// NewLeadForm.tsx (src/components/leads/NewLeadForm.tsx) · updated 09.10.2026 19:20 (Asia/Jerusalem) — CRM intake: mandatory company + contact name + mobile; optional email, industry, source, need, potential
import { useState } from "react";
import { Card, btnPrimary, btnGhost } from "@/components/ui";
import { Text, Select, Area } from "@/components/FormField";
import { INDUSTRIES } from "@/config/industries";
import { LEAD_SOURCES } from "@/config/sales";
import { ROLE_SUGGESTIONS } from "@/config/roles";
import { uid } from "@/lib/format";
import { useLang } from "@/i18n";
import type { Lead } from "@/lib/types";
const MOBILE = /^0?5\d[-\s]?\d{7}$|^\+?\d{9,14}$/;
export const EMPTY_NEW = { name: "", contact_name: "", contact_phone: "", contact_email: "", industry: "", source: "", use_case: "", contact_role: "", value_usd: "" };
type Props = { initial?: Partial<typeof EMPTY_NEW>; onSave: (l: Lead) => void; onCancel: () => void };
export default function NewLeadForm({ initial, onSave, onCancel }: Props) {
  const { t: tr } = useLang();
  const [n, setN] = useState({ ...EMPTY_NEW, ...initial });
  const [err, setErr] = useState("");
  const set = (k: keyof typeof EMPTY_NEW) => (v: string) => setN({ ...n, [k]: v });
  const save = () => {
    if (!n.name.trim() || !n.contact_name.trim() || !n.contact_phone.trim()) return setErr(tr("חובה: חברה, שם איש קשר, נייד"));
    if (!MOBILE.test(n.contact_phone.replace(/\s/g, ""))) return setErr(tr("מספר נייד לא תקין"));
    const lead: Lead = { id: uid("LEAD"), name: n.name.trim(), industry: n.industry || tr("אחר"), sub_industry: "", product_match: "", use_case: n.use_case, volume_tons: 0, value_usd: Number(n.value_usd) || 0, tier: "Tier 3 - New", department: "", contact_role: n.contact_role, status: "new", stage: "prospect", contact_name: n.contact_name.trim(), contact_phone: n.contact_phone.trim(), contact_email: n.contact_email.trim(), source: n.source || LEAD_SOURCES[0] };
    onSave(lead);
  };
  return (
    <Card className="space-y-2">
      <h3 className="font-bold">{tr("קליטת לקוח חדש")}</h3>
      <div className="grid md:grid-cols-3 gap-2">
        <Text label={tr("חברה")} value={n.name} onChange={set("name")} required />
        <Text label={tr("שם איש קשר")} value={n.contact_name} onChange={set("contact_name")} required />
        <Text label={tr("נייד")} value={n.contact_phone} onChange={set("contact_phone")} type="tel" required placeholder="05X-XXXXXXX" />
        <Text label={tr("אימייל")} value={n.contact_email} onChange={set("contact_email")} type="email" />
        <label className="text-xs text-slate-500 block">{tr("תפקיד")}<input list="roles" className="w-full border rounded-lg px-3 py-2 text-sm bg-white mt-1" value={n.contact_role} onChange={(e) => set("contact_role")(e.target.value)} /><datalist id="roles">{ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}</datalist></label>
        <Select label={tr("תעשייה")} value={n.industry} onChange={set("industry")} options={["", ...INDUSTRIES.map((i) => tr(i.he))]} />
        <Select label={tr("מקור הליד")} value={n.source} onChange={set("source")} options={["", ...LEAD_SOURCES.map((s) => tr(s))]} />
        <Text label={tr("פוטנציאל $ / שנה")} value={n.value_usd} onChange={set("value_usd")} />
        <div className="md:col-span-3"><Area label={tr("צורך / יישום")} value={n.use_case} onChange={set("use_case")} rows={2} /></div>
      </div>
      <div className="flex items-center justify-between"><span className="text-xs text-red-600">{err}</span><div className="flex gap-2"><button className={btnGhost} onClick={onCancel}>{tr("ביטול")}</button><button className={btnPrimary} onClick={save}>{tr("שמור לקוח")}</button></div></div>
    </Card>
  );
}
