"use client";
// page.tsx (src/app/campaign/page.tsx) · updated 09.10.2026 09:40 (Asia/Jerusalem) — promotion generator per industry (email / WhatsApp / LinkedIn)
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PRODUCTS, INDUSTRIES, industriesOf } from "@/lib/data";
import { Card, H1, Badge, inputCls } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
import { CHANNELS, channelHe, DEFAULT_ANGLE } from "@/config/channels";
import { industryHe } from "@/config/industries";
import { campaignContext, campaignPrompt } from "@/prompts/campaign";
export default function CampaignPage() {
  const { state, ready, addSpend } = useStore();
  const [ind, setInd] = useState("food"); const [ch, setCh] = useState("email"); const [angle, setAngle] = useState(DEFAULT_ANGLE);
  if (!ready) return null;
  const prods = PRODUCTS.filter((p) => industriesOf(p).includes(ind));
  const targets = state.leads.filter((l) => INDUSTRIES.find((i) => i.key === ind)?.match.test(l.industry + " " + l.use_case));
  const indHe = industryHe(ind);
  const ctx = campaignContext(indHe, angle, targets, prods);
  return (
    <div className="space-y-4">
      <H1 sub="בחר תעשייה + ערוץ → Claude מייצר את חומר הקידום מתוך הקטלוג">קמפיין קידום</H1>
      <Card className="grid md:grid-cols-3 gap-2">
        <select className={inputCls} value={ind} onChange={(e) => setInd(e.target.value)}>{INDUSTRIES.map((i) => <option key={i.key} value={i.key}>{i.he}</option>)}</select>
        <select className={inputCls} value={ch} onChange={(e) => setCh(e.target.value)}>{CHANNELS.map((c) => <option key={c.key} value={c.key}>{c.he}</option>)}</select>
        <input className={inputCls} value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="זווית מסחרית" />
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        <Card><h3 className="font-bold mb-2">מוצרים בקמפיין ({prods.length})</h3><div className="flex flex-wrap gap-1">{prods.map((p) => <Badge key={p.id} tone="blue">{p.product_name}</Badge>)}</div></Card>
        <Card><h3 className="font-bold mb-2">לקוחות יעד ({targets.length})</h3><div className="flex flex-wrap gap-1">{targets.map((t) => <Badge key={t.id} tone="green">{t.name}</Badge>)}{targets.length === 0 && <span className="text-sm text-slate-400">אין לקוחות בתעשייה זו עדיין</span>}</div></Card>
      </div>
      <Card>
        <AiPanel title={"קמפיין " + indHe + " — " + channelHe(ch)} buttonLabel="צור חומר קידום" sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)}
          buildPrompt={() => ({ context: ctx, prompt: campaignPrompt(indHe, ch) })} />
      </Card>
    </div>
  );
}
