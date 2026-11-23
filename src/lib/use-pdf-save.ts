"use client";
// use-pdf-save.ts (src/lib/use-pdf-save.ts) · created 23.11.2026 10:55 (Asia/Jerusalem) — v1.23.0 💾 order page: click → "Save as" window → the A4 order form PDF is written where you chose (no new tab)
import { useState } from "react";
import { savePdfAs, pdfFromHiddenPage, type SaveResult } from "@/lib/pdf-download";
import type { Order } from "@/lib/types";

export const orderPdfName = (o: Order) => [o.id, (o.customer?.company || o.lead_name || "").trim()].filter(Boolean).join("_");

export function useOrderPdfSave(o?: Order) {
  const [st, setSt] = useState<"" | "busy" | SaveResult | "err">("");
  const save = () => {
    if (!o) return;
    const name = orderPdfName(o); setSt("busy");
    savePdfAs(name, () => pdfFromHiddenPage("/orders/" + o.id + "/print?embed=1")).then(setSt, () => setSt("err"));
  };
  const msg = st === "busy" ? "⏳ מכין PDF…" : st === "saved" ? "✓ ה-PDF נשמר בתיקייה שבחרת — צרף אותו למייל." : st === "downloads" ? "✓ ה-PDF נשמר בתיקיית ההורדות (Downloads) — צרף אותו למייל." : st === "err" ? "⚠ השמירה נכשלה — נסה שוב." : "";
  return { save, busy: st === "busy", msg };
}
