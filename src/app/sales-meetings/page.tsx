"use client";
// page.tsx (src/app/sales-meetings/page.tsx) · created 27.10.2026 05:05 (Asia/Jerusalem) — v1.0.0 — OWNER ONLY
// 🤝 Sales meetings & calls — Pini / customers, physical · phone · Teams · WhatsApp. Typed notes or photos of handwritten pages → AI → review → customer cards + tasks.
import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { H1 } from "@/components/ui";
import NewMeeting from "@/components/salesmeet/NewMeeting";
import MeetingList from "@/components/salesmeet/MeetingList";
import type { SalesMeeting } from "@/lib/sales-meeting-types";
export default function SalesMeetingsPage() {
  const { state, ready, addSpend, addActivity, addTask, upsertLead } = useStore();
  const [items, setItems] = useState<SalesMeeting[]>([]); const [err, setErr] = useState("");
  const load = useCallback(() => { fetch("/api/sales-meetings", { cache: "no-store" }).then((r) => r.json()).then((j) => { if (j.error) setErr(j.error); else setItems(j.meetings || []); }).catch(() => setErr("טעינה נכשלה")); }, []);
  useEffect(load, [load]);
  if (!ready) return null;
  return (
    <div className="space-y-4">
      <H1 sub="פגישות עם פיני וללקוחות — פיזיות, טלפון, Teams, WhatsApp. מקלידים או מצלמים את דפי כתב היד → ה-AI מסכם → בודקים → נכנס לכרטיסי הלקוח ול'היום שלי'.">🤝 פגישות ושיחות מכירה</H1>
      <NewMeeting leads={state.leads} spend={state.spend} addSpend={addSpend} addActivity={addActivity} addTask={addTask} upsertLead={upsertLead} onSaved={load} />
      {err && <div className="text-sm text-red-600">⚠ {err}</div>}
      <MeetingList items={items} />
    </div>
  );
}
