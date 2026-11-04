// search-golden.ts (scripts/search-golden.ts) · created 04.11.2026 11:55 (Asia/Jerusalem) — v1.4.8 golden tests for quick match (competitor code → Silitex).
// Run before any change to search or equivalents data:  npx tsx --tsconfig tsconfig.json scripts/search-golden.ts
// Each line = a real question with the ONLY acceptable kind of answer. Add a line whenever a customer question exposes a mistake.
import { searchEquiv, knownCode } from "@/lib/equiv-search";
type Case = { q: string; none?: boolean; known?: boolean; top?: RegExp; never?: RegExp };
const CASES: Case[] = [
  { q: "OFX-8040", none: true, known: true, never: /OFX-0190|OFX-0193/ },   // 04/11/2026 Polish RFQ: was a fake "partial match"
  { q: "OFX-8040A", none: true, known: true },
  { q: "8040", none: true },                                                 // DC 8040 does not exist (checked 27/10/2026)
  { q: "diamino", none: true },
  { q: "OFX-0193", top: /PEG-12 DIMETHICONE|IDROAMISIL/ },
  { q: "SAG 30", top: /ANTISCHIUMA|BERETEX/, never: /SeraSense SA 30|MHX-1107/ },
  { q: "DC 245", top: /CYCLOPENTASILOXANE/ },
  { q: "PMX-200", top: /DIMETHICONE|LUBROFIL/, never: /PMX-1503|PMX-0345|PMX-1508/ },
  { q: "SF1708", top: /AMODIMETHICONE|STONIX/ },
  { q: "9040", top: /SILIBLEND|Cosmetics catalogue/ },
];
let bad = 0;
for (const c of CASES) {
  const h = searchEquiv(c.q, 6); const txt = h.map((x) => x.competitor + " ⇒ " + x.silitex).join(" | ");
  const errs: string[] = [];
  if (c.none && h.length) errs.push("expected NO match, got: " + txt);
  if (c.known && !knownCode(c.q)) errs.push("expected the honest 'known product, no Silitex equivalent' box");
  if (c.top && !(h[0] && c.top.test(h[0].competitor + " " + h[0].silitex))) errs.push("top answer should match " + c.top + ", got: " + (txt || "nothing"));
  if (c.never && c.never.test(txt)) errs.push("must never show " + c.never + ", got: " + txt);
  console.log((errs.length ? "❌ " : "✅ ") + c.q.padEnd(12) + (errs.length ? errs.join(" · ") : ""));
  bad += errs.length ? 1 : 0;
}
if (bad) { console.error("\n" + bad + " golden case(s) failed"); process.exit(1); }
