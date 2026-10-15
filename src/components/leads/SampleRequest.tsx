"use client";
// SampleRequest.tsx (src/components/leads/SampleRequest.tsx) · updated 15.10.2026 14:50 (Asia/Jerusalem) — "Request sample from Silitex": builds the English email to Silitex Italy from the lead + intake (product, kg, documents, application, needed-by), ship-to Sapirim (customer anonymous, default — protects the account) or direct to the customer lab. Open in Outlook / Gmail / copy → logs the sample as "requested" with a 7-day follow-up.
import { useMemo, useState } from "react";
import { inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { useLang } from "@/i18n";
import { intakeOf } from "@/lib/intake";
import { fmtDate, todayIso, addDays } from "@/lib/format";
import { IMPORTER } from "@/config/shipping";
import { SILITEX } from "@/config/hub";
import type { Lead, SilitexContact } from "@/lib/types";
type Props = { lead: Lead; contacts: SilitexContact[]; sku: string; skus: string[]; onLogged: (sku: string, kg: number) => void; onClose: () => void };
const DOCS = ["TDS", "SDS (EN, 16 sections)", "CoA of the sample batch", "Kosher certificate", "FDA 21 CFR statement", "REACH / D4-D5-D6 statement"];
const pickDefault = (cs: SilitexContact[]) => { const ok = cs.filter((c) => c.email && !/^info@/i.test(c.email)); return (ok.find((c) => c.dept === "customer") || ok.find((c) => c.dept === "backoffice") || ok.find((c) => c.dept === "sales") || ok.find((c) => c.dept === "mgmt") || ok[0])?.email || SILITEX.info; };
export default function SampleRequest({ lead, contacts, sku: sku0, skus, onLogged, onClose }: Props) {
  const { t: tr } = useLang();
  const v = intakeOf(lead);
  const yes = (x?: string) => !!x && /yes|כן|preferred|required|נדרש/i.test(x);
  const [to, setTo] = useState(pickDefault(contacts));
  const [cc, setCc] = useState("");
  const [sku, setSku] = useState(sku0);
  const [kg, setKg] = useState((v.SIL_002 || "").match(/[\d.]+/)?.[0] || "2");
  const [ship, setShip] = useState<"sapirim" | "direct">("sapirim");
  const [docs, setDocs] = useState<string[]>(["TDS", "SDS (EN, 16 sections)", ...(yes(v.REG_003) ? ["Kosher certificate"] : []), ...(yes(v.REG_002) ? ["FDA 21 CFR statement"] : []), ...(yes(v.REG_001) ? ["REACH / D4-D5-D6 statement"] : [])]);
  const [ctx, setCtx] = useState(true);
  const [by, setBy] = useState(v.TRK_001 && /^\d{4}-\d{2}-\d{2}$/.test(v.TRK_001) ? v.TRK_001 : addDays(todayIso(), 14));
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const emails = contacts.filter((c) => c.email).map((c) => ({ email: c.email as string, label: c.name + " · " + (c.role || c.dept) }));
  const subject = "Sample request — " + sku + " · " + kg + " kg — Israel (" + lead.industry + ")";
  const body = useMemo(() => {
    const L: string[] = ["Dear Silitex team,", "", "Please prepare a sample for an Israeli customer:", "", "• Product: " + sku, "• Quantity: " + kg + " kg", "• Needed in Israel by: " + fmtDate(by)];
    if (ship === "sapirim") L.push("• Ship to: " + IMPORTER.name + ", " + IMPORTER.address + " — " + IMPORTER.contact + " (we forward to the customer lab)");
    else L.push("• Ship DIRECT to the customer lab:", "   " + lead.name + (v.ACC_004 ? ", " + v.ACC_004 : lead.city ? ", " + lead.city : ""), "   Attn: " + (v.CON_004 || lead.contact_name || "R&D / lab") + (lead.contact_phone ? " · " + lead.contact_phone : "") + (lead.contact_email ? " · " + lead.contact_email : ""), "   Please copy Sapirim (" + IMPORTER.contact.split(" · ")[1] + ") on all shipping documents.");
    if (docs.length) L.push("• Documents with the sample: " + docs.join(", "));
    if (ctx) {
      L.push("", "Application context" + (ship === "sapirim" ? " (customer: Israeli " + lead.industry.toLowerCase() + " producer)" : "") + ":");
      const app = [v.APP_001 || lead.use_case, v.APP_005].filter(Boolean).join(" — "); if (app) L.push("• Use: " + app);
      if (v.APP_004) L.push("• Matrix / carrier: " + v.APP_004); if (v.APP_002) L.push("• Process pH: " + v.APP_002); if (v.APP_003) L.push("• Temperature: " + v.APP_003 + " °C");
      const inc = [v.BEN_001, v.BEN_002].filter(Boolean).join(" "); if (inc || lead.competitor_offset) L.push("• Currently using: " + (inc || lead.competitor_offset));
      if (v.SIL_004) L.push("• Lab test protocol: " + v.SIL_004);
    }
    if (note.trim()) L.push("", note.trim());
    L.push("", "Please confirm dispatch date and tracking number.", "", "Best regards,", "Avshi Sapir · Sapirim — Silitex Israel", "+972-50-5231042 · avshi@sapirim.com");
    return L.join("\n");
  }, [sku, kg, by, ship, docs, ctx, note, lead, v]);
  const log = () => { if (!done) { onLogged(sku, Number(kg) || 1); setDone(true); } };
  const mailto = "mailto:" + to + "?" + (cc ? "cc=" + encodeURIComponent(cc) + "&" : "") + "subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  const gmail = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(to) + (cc ? "&cc=" + encodeURIComponent(cc) : "") + "&su=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  const toggle = (d: string) => setDocs((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]));
  const lbl = "text-xs text-slate-500";
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-4 space-y-3 max-h-[92vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><div className="font-bold">📧 {tr("בקשת דגימה מ-Silitex")} · {lead.name}</div><button className={btnGhost} onClick={onClose}>✕</button></div>
        <div className="grid md:grid-cols-2 gap-2">
          <label className={lbl}>{tr("אל")}<select className={inputCls + " mt-0.5"} dir="ltr" value={to} onChange={(e) => setTo(e.target.value)}>{emails.map((x) => <option key={x.email} value={x.email}>{x.label} — {x.email}</option>)}<option value={SILITEX.info}>Silitex — {SILITEX.info}</option></select></label>
          <label className={lbl}>CC<select className={inputCls + " mt-0.5"} dir="ltr" value={cc} onChange={(e) => setCc(e.target.value)}><option value="">—</option>{emails.filter((x) => x.email !== to).map((x) => <option key={x.email} value={x.email}>{x.label}</option>)}</select></label>
          <label className={lbl}>{tr("מוצר Silitex")}<input className={inputCls + " mt-0.5"} dir="ltr" list="sr-skus" value={sku} onChange={(e) => setSku(e.target.value)} /><datalist id="sr-skus">{skus.map((s) => <option key={s} value={s} />)}</datalist></label>
          <div className="grid grid-cols-2 gap-2"><label className={lbl}>{tr("כמות (ק\"ג)")}<input className={inputCls + " mt-0.5"} dir="ltr" value={kg} onChange={(e) => setKg(e.target.value)} /></label><label className={lbl}>{tr("נדרש בישראל עד")}<input type="date" className={inputCls + " mt-0.5"} value={by} onChange={(e) => setBy(e.target.value)} /></label></div>
        </div>
        <div className="border rounded-xl p-2 text-sm space-y-1">
          <div className="font-medium">{tr("משלוח אל")}</div>
          <label className="flex items-center gap-2"><input type="radio" checked={ship === "sapirim"} onChange={() => setShip("sapirim")} />{tr("Sapirim — אני מעביר ללקוח (שם הלקוח לא נחשף ל-Silitex) — מומלץ")}</label>
          <label className="flex items-center gap-2"><input type="radio" checked={ship === "direct"} onChange={() => setShip("direct")} />{tr("ישירות למעבדת הלקוח (שם, כתובת וכימאי נשלחים ל-Silitex)")}</label>
          {ship === "direct" && !v.ACC_004 && <div className="text-xs text-amber-700">⚠ {tr("חסרה כתובת מפעל בטופס הבירור (ACC_004)")}</div>}
        </div>
        <div className="text-sm"><div className="font-medium mb-1">{tr("מסמכים עם הדגימה")}</div><div className="flex flex-wrap gap-1">{DOCS.map((d) => <button key={d} onClick={() => toggle(d)} className={"text-xs px-2 py-1 rounded-full border " + (docs.includes(d) ? "bg-brand-500 text-white border-brand-500" : "bg-white")}>{d}</button>)}</div></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ctx} onChange={(e) => setCtx(e.target.checked)} />{tr("לצרף הקשר יישום (שימוש, מטריצה, pH, ספק נוכחי) — עוזר ל-Silitex לבחור דרגה")}</label>
        <label className={lbl + " block"}>{tr("הערה חופשית (אנגלית)")}<input className={inputCls + " mt-0.5"} dir="ltr" value={note} onChange={(e) => setNote(e.target.value)} /></label>
        <div><div className={lbl}>{tr("תצוגה מקדימה")}</div><div className="text-xs font-medium mt-1" dir="ltr">{subject}</div><pre className="text-xs bg-slate-50 border rounded-lg p-2 whitespace-pre-wrap mt-1" dir="ltr">{body}</pre></div>
        <div className="flex flex-wrap gap-2 items-center">
          <a className={btnPrimary} href={mailto} onClick={log}>📧 {tr("פתח ב-Outlook")}</a>
          <a className={btnGhost} href={gmail} target="_blank" rel="noreferrer" onClick={log}>Gmail</a>
          <button className={btnGhost} onClick={() => { navigator.clipboard?.writeText(subject + "\n\n" + body).catch(() => {}); log(); }}>📋 {tr("העתק")}</button>
          {done && <span className="text-xs text-emerald-700">✓ {tr("נרשמה דגימה \"התבקשה\" + מעקב בעוד 7 ימים")}</span>}
        </div>
      </div>
    </div>
  );
}
