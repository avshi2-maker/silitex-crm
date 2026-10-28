// expo-ready-html.ts (src/lib/expo-ready-html.ts) · created 28.10.2026 08:45 (Asia/Jerusalem) — v1.3.0 one Expo Ready pack as a plain English HTML document (NotebookLM "Website" source for Federica's notebook — Silitex IT blocks the CRM, Google fetches it instead)
import { route, where, type Pack, type Minor } from "@/lib/expo-ready";

const e = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const list = (title: string, xs?: Minor[]) => !xs?.length ? "" :
  `<h2>${e(title)}</h2><ul>${xs.map((x) => `<li><b>${e(x.company)}</b>${x.country ? " (" + e(x.country) + ")" : ""} — ${e(where(x))}${x.grade ? " — grade " + e(x.grade) : ""} — ${e(x.one_line)}</li>`).join("")}</ul>`;

export function packHtml(p: Pack): string {
  const sh = p.show; let n = 0;
  const rows = route(p.top).map(([hall, xs]) => xs.map((s) => { n += 1; return `<tr><td>${n}</td><td>${e(hall)}</td><td>${e(s.stand || "—")}</td><td>${e(s.company)}</td><td>${e(s.grade)}</td><td>${e(s.silitex_products[0] || "—")}</td></tr>`; }).join("")).join("");
  const briefs = p.top.map((s, i) => `<h3>${i + 1}. ${e(s.company)}${s.country ? " (" + e(s.country) + ")" : ""}</h3><ul>
<li><b>Where:</b> ${e(where(s))}${s.website ? " · " + e(s.website) : ""}${s.list_year && s.list_year < 2026 ? " · from the " + s.list_year + " list" : ""}</li>
<li><b>Grade:</b> ${e(s.grade)}${s.angle ? " · <b>Angle:</b> " + e(s.angle) : ""}</li>
<li><b>Makes:</b> ${e(s.what_they_make)}</li><li><b>Silitex fit:</b> ${e(s.why_silitex)}</li>
<li><b>Silitex products:</b> ${e(s.silitex_products.join(", "))}</li>
<li><b>Opening questions:</b><ol>${s.opening_questions.map((q) => "<li>" + e(q) + "</li>").join("")}</ol></li>${s.avoid ? "<li><b>Avoid:</b> " + e(s.avoid) + "</li>" : ""}</ul>`).join("\n");
  const a = p.top.filter((s) => s.grade === "A").length;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Silitex Expo Ready — ${e(sh.name)}</title>
<style>body{font-family:Arial,sans-serif;max-width:900px;margin:24px auto;padding:0 16px;line-height:1.45;color:#1e293b}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ddd;padding:4px;text-align:left}h1,h2{color:#0f3d5e}</style></head><body>
<h1>Silitex Expo Ready — ${e(sh.name)}</h1>
<p>${e(sh.city)} · ${e(sh.dates)} · ${e(sh.venue)}</p>${sh.hours ? `<p>Opening hours: ${e(sh.hours)}</p>` : ""}${sh.own_stand ? `<p><b>Silitex stand: ${e(sh.own_stand)}</b></p>` : ""}
<p>Prepared for Federica (Silitex S.r.l.) by Avshi Sapir, Sapirim — Silitex Israel · avshi@sapirim.com · +972 50 523 1042. Research from the official exhibitor list; re-check stands in the show app.</p>
${sh.notes ? `<p>${e(sh.notes)}</p>` : ""}
<p>Summary: ${p.screened_count} exhibitors screened, ${p.top.length} stand briefs (${a} grade A). Grade A = clear fit, visit first; B = plausible.</p>
<h2>Day route — hall by hall</h2><table><tr><th>#</th><th>Hall</th><th>Stand</th><th>Company</th><th>Grade</th><th>Lead Silitex product</th></tr>${rows}</table>
<h2>Stand briefs</h2>${briefs}
${list("Distributors exhibiting", p.distributors)}${list("Additive competitors exhibiting", p.competitors)}${list("Also screened", p.others)}
${sh.sources?.length ? `<h2>Sources</h2><ul>${sh.sources.map((u) => "<li>" + e(u) + "</li>").join("")}</ul>` : ""}
</body></html>`;
}
