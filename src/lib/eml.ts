// eml.ts (src/lib/eml.ts) · created 25.10.2026 (Asia/Jerusalem)
// 📧 Outlook draft file (.eml): Hebrew-safe (UTF-8, base64) + real attachments (PDF / Excel).
// Why: mailto: links cannot carry files, and Outlook breaks long Hebrew mailto text into "&#1492;" garbage.
// The .eml has "X-Unsent: 1" → Outlook opens it as a NEW draft: To / CC / subject / body / files ready → Send.
export type EmlFile = { filename: string; base64: string; type: string };
export type EmlInput = { to?: string; cc?: string; subject: string; text: string; html?: string; files?: EmlFile[] };

const utf8b64 = (s: string) => { const u = new TextEncoder().encode(s); let b = ""; for (let i = 0; i < u.length; i += 0x8000) b += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(b); };
const wrap = (b64: string) => b64.replace(/.{1,76}/g, "$&\r\n").trimEnd();
const hdr = (s: string) => /^[\x20-\x7e]*$/.test(s) ? s : "=?UTF-8?B?" + utf8b64(s) + "?=";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Full HTML mail document (Outlook needs <meta charset> + dir=rtl at the top, or Hebrew turns to garbage). */
export function mailDoc(inner: string) {
  return '<!doctype html><html dir="rtl" lang="he"><head><meta charset="utf-8"><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body dir="rtl" style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;direction:rtl;text-align:right">' + inner + "</body></html>";
}
export const textToHtml = (t: string) => esc(t).replace(/\r?\n/g, "<br>");

export function buildEml({ to = "", cc = "", subject, text, html, files = [] }: EmlInput): Blob {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const mix = "mix_" + id, alt = "alt_" + id;
  const L: string[] = [];
  if (to.trim()) L.push("To: " + to.trim());
  if (cc.trim()) L.push("Cc: " + cc.trim());
  L.push("Subject: " + hdr(subject), "X-Unsent: 1", "MIME-Version: 1.0", 'Content-Type: multipart/mixed; boundary="' + mix + '"', "", "--" + mix,
    'Content-Type: multipart/alternative; boundary="' + alt + '"', "",
    "--" + alt, "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", wrap(utf8b64(text)), "",
    "--" + alt, "Content-Type: text/html; charset=UTF-8", "Content-Transfer-Encoding: base64", "", wrap(utf8b64(html || mailDoc(textToHtml(text)))), "",
    "--" + alt + "--", "");
  for (const f of files) {
    const n = f.filename.replace(/["\r\n]/g, "_");
    L.push("--" + mix, 'Content-Type: ' + f.type + '; name="' + n + '"', "Content-Transfer-Encoding: base64", 'Content-Disposition: attachment; filename="' + n + '"', "", wrap(f.base64), "");
  }
  L.push("--" + mix + "--", "");
  return new Blob([L.join("\r\n")], { type: "message/rfc822" });
}

/** Download the draft; double-click it → Outlook opens it ready to send. */
export function downloadEml(e: EmlInput, name: string) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(buildEml(e)); a.download = name.replace(/[\\/:*?"<>|]+/g, "_") + ".eml"; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
