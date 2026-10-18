// json.ts (src/lib/studio/json.ts) · updated 18.10.2026 18:00 (Asia/Jerusalem) — tolerant JSON reader for AI output: takes the outer {...}, escapes raw line breaks/tabs and stray quotes inside strings, drops trailing commas. Long multi-paragraph posts (esp. Russian) often break strict JSON.parse.
export function parseLoose<T>(text: string): T | null {
  const s = text.indexOf("{"), e = text.lastIndexOf("}"); if (s < 0 || e <= s) return null;
  const raw = text.slice(s, e + 1);
  try { return JSON.parse(raw) as T; } catch {}
  let out = "", inStr = false, esc = false; const chars = Array.from(raw);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (inStr) {
      if (esc) { out += ch; esc = false; continue; }
      if (ch === "\\") { out += ch; esc = true; continue; }
      if (ch === '"') { let k = i + 1; while (k < chars.length && /\s/.test(chars[k])) k++; if (k >= chars.length || /[,}\]:]/.test(chars[k])) { inStr = false; out += ch; } else out += '\\"'; continue; } // a quote not followed by , } ] : is text, not the end of the string
      if (ch === "\n") { out += "\\n"; continue; } if (ch === "\r") continue; if (ch === "\t") { out += "\\t"; continue; }
      out += ch;
    } else { if (ch === '"') inStr = true; out += ch; }
  }
  out = out.replace(/,\s*([}\]])/g, "$1");
  try { return JSON.parse(out) as T; } catch { return null; }
}
