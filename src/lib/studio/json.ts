// json.ts (src/lib/studio/json.ts) · updated 18.10.2026 18:00 (Asia/Jerusalem) — tolerant JSON reader for AI output: takes the outer {...}, escapes raw line breaks/tabs and stray quotes inside strings, drops trailing commas; rescues answers cut off at the token limit. Long multi-paragraph posts (esp. Russian) often break strict JSON.parse.
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
  try { return JSON.parse(out) as T; } catch {}
  return closeTruncated<T>(text.slice(s));
}
/** answer cut off at the token limit: keep what arrived — close the open string, drop a dangling key, close every open { [ */
function closeTruncated<T>(t: string): T | null {
  let out = "", inStr = false, esc = false; const stack: string[] = [];
  for (const ch of t) {
    if (inStr) { if (esc) { esc = false; out += ch; continue; } if (ch === "\\") { esc = true; out += ch; continue; } if (ch === '"') inStr = false; else if (ch === "\n") { out += "\\n"; continue; } else if (ch === "\r") continue; out += ch; continue; }
    if (ch === '"') inStr = true; else if (ch === "{" || ch === "[") stack.push(ch === "{" ? "}" : "]"); else if (ch === "}" || ch === "]") stack.pop();
    out += ch;
  }
  if (esc) out = out.slice(0, -1); if (inStr) out += '"';
  for (let i = 0; i < 6; i++) {
    const tail = out.replace(/,\s*$/, "").replace(/,\s*"[^"]*"\s*:?\s*$/, "").replace(/:\s*$/, ': ""');
    try { return JSON.parse(tail + stack.slice().reverse().join("")) as T; } catch {}
    out = out.replace(/,?\s*"[^"]*"\s*:\s*("[^"]*")?\s*$/, ""); // drop the last unfinished field and retry
  }
  return null;
}
