"use client";
// page.tsx (src/app/campaign/page.tsx) · updated 09.10.2026 09:10 (Asia/Jerusalem) — promotion generator per industry (email / WhatsApp / LinkedIn)
import { useState } from "react";
import { useStore } from "@/lib/store";
import { PRODUCTS, INDUSTRIES, industriesOf } from "@/lib/data";
import { Card, H1, Badge, inputCls } from "@/components/ui";
import AiPanel from "@/components/AiPanel";
const CHANNELS = [{ k: "email", he: "מייל" }, { k: "whatsapp", he: "WhatsApp" }, { k: "linkedin", he: "פוסט LinkedIn" }, { k: "onepager", he: "דף מוצר A4" }];
export default function CampaignPage() {
  const { state, ready, addSpend } = useStore();
  const [ind, setInd] = useState("food"); const [ch, setCh] = useState("email"); const [angle, setAngle] = useState("החלפת ספק Dow/Wacker במלאי מקומי + אישורי FDA/כשרות");
  if (!ready) return null;
  const prods = PRODUCTS.filter((p) => industriesOf(p).includes(ind));
  const targets = state.leads.filter((l) => INDUSTRIES.find((i) => i.key === ind)?.match.test(l.industry + " " + l.use_case));
  const indHe = INDUSTRIES.find((i) => i.key === ind)?.he || ind;
  const ctx = "תעשייה: " + indHe + "\nזווית: " + angle + "\nלקוחות יעד: " + targets.map((t) => t.name).join(", ") + "\n\nמוצרים:\n" + prods.map((p) => "- " + p.product_name + " | " + p.application_field + " | " + p.key_features + " | " + p.food_grade_certifications + " | מחליף: " + p.dow_corning_offset_benchmark).join("\n");
  return (
    <div className="space-y-4">
      <H1 sub="בחר תעשייה + ערוץ → Claude מייצר את חומר הקידום מתוך הקטלוג">קמפיין קידום</H1>
      <Card className="grid md:grid-cols-3 gap-2">
        <select className={inputCls} value={ind} onChange={(e) => setInd(e.target.value)}>{INDUSTRIES.map((i) => <option key={i.key} value={i.key}>{i.he}</option>)}</select>
        <select className={inputCls} value={ch} onChange={(e) => setCh(e.target.value)}>{CHANNELS.map((c) => <option key={c.k} value={c.k}>{c.he}</option>)}</select>
        <input className={inputCls} value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="זווית מסחרית" />
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        <Card><h3 className="font-bold mb-2">מוצרים בקמפיין ({prods.length})</h3><div className="flex flex-wrap gap-1">{prods.map((p) => <Badge key={p.id} tone="blue">{p.product_name}</Badge>)}</div></Card>
        <Card><h3 className="font-bold mb-2">לקוחות יעד ({targets.length})</h3><div className="flex flex-wrap gap-1">{targets.map((t) => <Badge key={t.id} tone="green">{t.name}</Badge>)}{targets.length === 0 && <span className="text-sm text-slate-400">אין לקוחות בתעשייה זו עדיין</span>}</div></Card>
      </div>
      <Card>
        <AiPanel title={"קמפיין " + indHe + " — " + CHANNELS.find((c) => c.k === ch)?.he} buttonLabel="צור חומר קידום" sessionTokens={state.spend.tokens} sessionCost={state.spend.cost} onUsage={(u) => addSpend(u.input_tokens + u.output_tokens, u.cost_usd)}
          buildPrompt={() => ({ context: ctx, prompt: "צור " + CHANNELS.find((c) => c.k === ch)?.he + " שיווקי בעברית לתעשיית " + indHe + ". ערוץ: " + ch + ". " + (ch === "whatsapp" ? "עד 90 מילים, אמוג'י מינימלי." : ch === "linkedin" ? "עד 150 מילים, 3 האשטגים." : ch === "onepager" ? "מבנה דף A4: כותרת, 3 יתרונות, טבלת מוצר→מקבילה, אישורים, CTA." : "שורת נושא + גוף עד 200 מילים.") + " הדגש מוצרים ספציפיים והמקבילות שהם מחליפים." })} />
      </Card>
    </div>
  );
}
