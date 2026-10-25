"use client";
// page.tsx (src/app/campaign/page.tsx) · updated 25.10.2026 05:30 (Asia/Jerusalem) — ✅ approved mail (detergents · e-mail) ready to copy on top · default industry detergents · AI prompt with truth rules · 18.10.2026 17:25 — + link to Post Studio · 09.10.2026 10:30 — promotion generator per industry (email / WhatsApp / LinkedIn)
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PRODUCTS, INDUSTRIES, industriesOf } from "@/lib/data";
import { Card, H1, Badge, inputCls } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import ApprovedMail from "@/components/campaign/ApprovedMail";
import { CHANNELS, channelHe, DEFAULT_ANGLE } from "@/config/channels";
import { industryHe } from "@/config/industries";
import { campaignContext, campaignPrompt } from "@/prompts/campaign";
import { useLang } from "@/i18n";
export default function CampaignPage() {
  const { t: tr } = useLang();
  const { state, ready, addSpend } = useStore();
  const [ind, setInd] = useState("clean"); /* food excluded from promotion for now */ const [ch, setCh] = useState("email"); const [angle, setAngle] = useState(DEFAULT_ANGLE);
  if (!ready) return null;
  const prods = PRODUCTS.filter((p) => industriesOf(p).includes(ind));
  const targets = state.leads.filter((l) => INDUSTRIES.find((i) => i.key === ind)?.match.test(l.industry + " " + l.use_case));
  const indHe = industryHe(ind);
  const ctx = campaignContext(tr(indHe), angle, targets, prods);
  return (
    <div className="space-y-4">
      <H1 sub={tr("בחר תעשייה + ערוץ → ה-AI מייצר את חומר הקידום מתוך הקטלוג")}>{tr("קמפיין קידום")} <Link href="/studio" className="text-sm font-normal text-brand-600 underline">↗ {tr("סטודיו פוסטים — פוסטים ציבוריים וריילס")}</Link></H1>
      <Card className="grid md:grid-cols-3 gap-2">
        <select className={inputCls} value={ind} onChange={(e) => setInd(e.target.value)}>{INDUSTRIES.map((i) => <option key={i.key} value={i.key}>{tr(i.he)}</option>)}</select>
        <select className={inputCls} value={ch} onChange={(e) => setCh(e.target.value)}>{CHANNELS.map((c) => <option key={c.key} value={c.key}>{tr(c.he)}</option>)}</select>
        <input className={inputCls} value={angle} onChange={(e) => setAngle(e.target.value)} placeholder={tr("זווית מסחרית")} />
      </Card>
      <ApprovedMail ind={ind} channel={ch} />
      <div className="grid md:grid-cols-2 gap-4">
        <Card><h3 className="font-bold mb-2">{tr("מוצרים בקמפיין (")}{prods.length})</h3><div className="flex flex-wrap gap-1">{prods.map((p) => <Badge key={p.id} tone="blue">{p.product_name}</Badge>)}</div></Card>
        <Card><h3 className="font-bold mb-2">{tr("לקוחות יעד (")}{targets.length})</h3><div className="flex flex-wrap gap-1">{targets.map((t) => <Badge key={t.id} tone="green">{t.name}</Badge>)}{targets.length === 0 && <span className="text-sm text-slate-400">{tr("אין לקוחות בתעשייה זו עדיין")}</span>}</div></Card>
      </div>
      <Card>
        <AiPanel title={tr("קמפיין ") + tr(indHe) + " — " + channelHe(ch)} buttonLabel={tr("צור חומר קידום")} sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)}
          buildPrompt={() => ({ context: ctx, prompt: campaignPrompt(tr(indHe), ch) })} />
      </Card>
    </div>
  );
}
