// kb-clean.ts (src/lib/kb-clean.ts) · created 28.10.2026 06:45 (Asia/Jerusalem) — v1.2.1 silitex.it page text without website clutter (menu, languages, GDPR notice) for the NotebookLM knowledge sheet
const NOISE = /^(en|it|fr|de|Italiano|English|Français|Deutsch|-->|&times;|×|GROUP|Silitex|Unispray|Silitex Chemicals|Home|Company|Applications|Products|Technologies|News|Contact Us|Search|Caratteristiche Prodotti|Contact us now!|FIND OUT MORE|I authorize|Captcha|Clicca qui.*|PRIVACY NOTICE.*|I declare that.*|.*\| Silitex S\.r\.l\..*)$/i;
const NAME = /^[A-Z0-9][A-Z0-9 °().,\-\/+&']{1,60}$/;
const lines = (t: string) => t.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !NOISE.test(l));
const uniq = (a: string[]) => Array.from(new Set(a));

/** chunks of one scraped page → clean text. Family page = "NAME — description" list; product page = description + "label: value" specs */
export function kbClean(chunks: string[], name: string): string {
  const full = chunks.join("\n\n");
  const items = new Map<string, string>();
  for (const m of full.matchAll(/(?:^|\n)[ \t]*([^\n]+?)[ \t]*\n\s*\n[ \t]*([^\n]+?)[ \t]*\n\s*\n[ \t]*FIND OUT MORE/g)) {
    const n = m[1].trim(), d = m[2].trim();
    if (NAME.test(n) && !NOISE.test(d) && d.length > (items.get(n) || "").length) items.set(n, d);
  }
  if (items.size) return Array.from(items, ([n, d]) => n + " — " + d).join(" • ");
  const m = full.match(/Search\s*\n([\s\S]*?)Contact us now!/);
  const body = m ? m[1] : (full.split(/\bSearch\s*\n/).pop() || "");
  const [descPart, specPart = ""] = body.split(/Caratteristiche Prodotti/);
  const desc = uniq(lines(descPart)).filter((l) => l.toUpperCase() !== name.toUpperCase());
  const sp = lines(specPart); const specs: string[] = [];
  for (let i = 0; i + 1 < sp.length; i += 2) specs.push(sp[i] + ": " + sp[i + 1]);
  const out = desc.join(" ") + (specs.length ? " | " + specs.join("; ") : "");
  return out.trim() || "(no text scraped for this page)";
}
