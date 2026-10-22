"use client";
// ValidInput.tsx (src/components/ValidInput.tsx) · created 22.10.2026 07:20 (Asia/Jerusalem) — e-mail / mobile / phone input for every intake form: green ✓ when valid, red + hint when not, amber "already at …" when another customer / contact uses it. Rules in lib/validate.ts.
import { inputCls } from "./ui";
import { check, dupOf, okCls, HINT, type Kind, type PoolItem } from "@/lib/validate";
import { useLang } from "@/i18n";
type Props = { kind: Kind; value: string; onChange: (v: string) => void; label?: string; required?: boolean; placeholder?: string; className?: string; pool?: PoolItem[]; selfKey?: string; big?: boolean };
const PH: Record<Kind, string> = { email: "name@company.co.il", emails: "a@x.co.il, b@x.co.il", mobile: "05X-XXXXXXX", phone: "0X-XXXXXXX" };
export default function ValidInput({ kind, value, onChange, label, required, placeholder, className, pool, selfKey, big }: Props) {
  const { t: tr } = useLang(); const ok = check(kind, value); const dup = dupOf(kind, value, pool, selfKey);
  const input = <input type={kind === "mobile" || kind === "phone" ? "tel" : kind === "email" ? "email" : "text"} dir="ltr" className={(className || inputCls) + (label ? " mt-1" : "") + (big ? " text-base" : "") + okCls(ok)} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || PH[kind]} required={required} aria-invalid={ok === false} />;
  const notes = <>{ok === false && <span className="block mt-1 text-xs text-red-600">{tr(HINT[kind])}</span>}{dup && <span className="block mt-1 text-xs text-amber-700">⚠ {tr("כבר רשום אצל")} {dup}</span>}</>;
  if (!label) return <div className="min-w-0">{input}{notes}</div>;
  return <label className="text-xs text-slate-500 block">{label}{required && " *"}{ok === true && <span className="text-emerald-600"> ✓</span>}{input}{notes}</label>;
}
