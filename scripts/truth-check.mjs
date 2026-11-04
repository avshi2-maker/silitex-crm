// truth-check.mjs (scripts/truth-check.mjs) · created 04.11.2026 11:45 (Asia/Jerusalem) — v1.4.8 TRUTH GUARD (runs before every build).
// Avshi 04/11/2026: "this is serious — we must provide real data". If any rule fails, the build STOPS → Vercel keeps the last good version live.
// Rules:
//  1. A code proven fake (offsets.json rows[].removed status "fake") may not appear anywhere the app shows equivalents.
//  2. A code in known_codes.json (real product, no verified Silitex equivalent) may not be presented as an equivalent.
//  3. Every ✓ verified INCI check must carry a source link (or be owner-confirmed: src "Avshi").
import fs from "node:fs";
const rd = (f) => JSON.parse(fs.readFileSync(new URL("../src/data/" + f, import.meta.url), "utf8"));
const nz = (s) => String(s).toLowerCase().replace(/dow corning/g, "dc").replace(/[^a-z0-9]/g, "");
const offsets = rd("offsets.json");
const fake = new Map(); for (const r of offsets.rows) for (const x of r.removed || []) if (x.status === "fake") fake.set(nz(x.code), x.code);
const known = rd("known_codes.json").flatMap((k) => k.codes);
const errors = [];
// where equivalents are shown — split cells into single codes ("A / B", "A, B", "A · B")
const tokens = (s) => String(s || "").split(/\s+\/\s+|,\s+|\s+·\s+|;\s*/).map((t) => t.trim()).filter(Boolean);
const hit = (tok, codeN) => { const t = nz(tok); return t === codeN || (codeN.length >= 6 && t.endsWith(codeN)); };
const scan = (where, text) => {
  for (const tok of tokens(text)) {
    for (const [n, c] of fake) if (hit(tok, n)) errors.push(`FAKE code "${c}" shown in ${where}: "${tok}"`);
    for (const c of known) if (hit(tok, nz(c))) errors.push(`"${c}" has NO verified Silitex equivalent but is listed as one in ${where}`);
  }
};
for (const r of offsets.rows) { scan(`offsets ${r.category_id} Dow`, r.dow_corning); for (const [p, v] of Object.entries(r.offsets || {})) scan(`offsets ${r.category_id} ${p}`, v); }
for (const p of rd("products.json")) scan(`products ${p.product_name} (Replaces)`, p.dow_corning_offset_benchmark);
for (const g of rd("gaps.json")) { scan(`gaps ${g.id}`, g.producers); for (const a of g.aliases || []) scan(`gaps ${g.id} alias`, a); }
const ct = rd("silitex_cosmetic_countertypes.json"); for (const c of (Array.isArray(ct) ? ct : ct.rows || [])) for (const k of ["dow", "brb", "momentive", "wacker"]) scan(`cosmetic countertypes ${c.product}`, c[k]);
for (const [k, c] of Object.entries(offsets.inci_checks || {})) if (c.status === "ok" && !/^https?:\/\//.test(c.src || "") && c.src !== "Avshi") errors.push(`✓ verified "${k}" has no source link`);
if (errors.length) { console.error("\n❌ TRUTH CHECK FAILED — " + errors.length + " problem(s). Fix the data, then build again:\n  " + errors.join("\n  ") + "\n"); process.exit(1); }
console.log(`✅ truth check: ${fake.size} fake codes absent · ${known.length} no-equivalent codes not offered · verified checks all sourced`);
