// outlook-draft.ts (src/lib/outlook-draft.ts) · created 26.10.2026 05:50 (Asia/Jerusalem)
// 📧 Outlook 365 drafts: the CRM puts a ready draft (To / CC / subject / Hebrew HTML body / PDF + Excel files) straight into
// avshi@sapirim.com → Drafts, then opens it in Outlook on the web. Sign-in = Microsoft popup (PKCE, no secret), about once a day.
// Nothing is ever SENT by the CRM — you press Send in Outlook. (Separate from src/lib/outlook.ts = the Hub mail READER, server side.)
import { MS } from "@/config/outlook";

const KEY = "sx-outlook"; const PKCE = "sx-outlook-pkce"; export const GO = "sx-outlook-go"; // the sign-in popup reads GO and opens the draft itself (Microsoft cuts the popup link)
type Tok = { at: string; rt: string; exp: number; user?: string };
const AUTH = () => "https://login.microsoftonline.com/" + MS.tenant + "/oauth2/v2.0/";
const redirect = () => window.location.origin + MS.callbackPath;
const read = (): Tok | null => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };
const save = (t: Tok | null) => { try { if (t) localStorage.setItem(KEY, JSON.stringify(t)); else localStorage.removeItem(KEY); } catch { /* private mode */ } };
const b64url = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b instanceof Uint8Array ? b : new Uint8Array(b)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export const outlookConnected = () => !!read()?.rt;
export const outlookUser = () => read()?.user || "";
export const outlookDisconnect = () => save(null);

async function tokenCall(body: Record<string, string>): Promise<Tok> {
  const r = await fetch(AUTH() + "token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: MS.clientId, scope: MS.scope, ...body }) });
  const j = await r.json(); if (!r.ok) throw new Error(j.error_description || j.error || "token " + r.status);
  const user = (() => { try { return JSON.parse(atob((j.id_token || "").split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).preferred_username || ""; } catch { return read()?.user || ""; } })();
  const t: Tok = { at: j.access_token, rt: j.refresh_token || read()?.rt || "", exp: Date.now() + (j.expires_in - 120) * 1000, user }; save(t); return t;
}

/** called by the /outlook-callback page inside the popup */
export async function finishSignIn(code: string, state: string) {
  const p = JSON.parse(localStorage.getItem(PKCE) || "{}"); localStorage.removeItem(PKCE);
  if (!p.v || p.s !== state) throw new Error("sign-in expired — try again");
  await tokenCall({ grant_type: "authorization_code", code, redirect_uri: redirect(), code_verifier: p.v });
}

/** Microsoft sign-in in a popup. `win` must be opened by the click itself (popup blockers). */
async function signIn(win: Window): Promise<Tok> {
  const v = b64url(crypto.getRandomValues(new Uint8Array(32))); const s = b64url(crypto.getRandomValues(new Uint8Array(12)));
  const ch = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)));
  localStorage.setItem(PKCE, JSON.stringify({ v, s })); save(null);
  win.location.href = AUTH() + "authorize?" + new URLSearchParams({ client_id: MS.clientId, response_type: "code", redirect_uri: redirect(), scope: MS.scope, state: s, code_challenge: ch, code_challenge_method: "S256", login_hint: MS.loginHint, response_mode: "query" });
  return new Promise((ok, bad) => {
    const t0 = Date.now();
    const tick = setInterval(() => {
      const t = read(); if (t?.at) { clearInterval(tick); ok(t); return; }
      if (Date.now() - t0 > 180000) { clearInterval(tick); bad(new Error("ההתחברות ל-Outlook לא הושלמה — נסה שוב")); }
    }, 400);
  });
}

let viaPopup = false;
async function token(win: Window): Promise<string> {
  viaPopup = false;
  const t = read();
  if (t?.at && t.exp > Date.now()) return t.at;
  if (t?.rt) { try { return (await tokenCall({ grant_type: "refresh_token", refresh_token: t.rt, redirect_uri: redirect() })).at; } catch { /* day expired → sign in */ } }
  viaPopup = true; return (await signIn(win)).at;
}

export type DraftFile = { filename: string; base64: string; type: string };
export type Draft = { to?: string; cc?: string; subject: string; html: string; files?: DraftFile[] };
const list = (s = "") => s.split(/[,;\s]+/).filter((x) => x.includes("@")).map((a) => ({ emailAddress: { address: a } }));
const G = "https://graph.microsoft.com/v1.0/me/messages";

/**
 * Creates the draft in avshi@sapirim.com → Drafts and opens it in Outlook web in the window `win`.
 * Call `const win = window.open("", "_blank")` FIRST, inside the click, then `await outlookDraft(d, win)`.
 */
export async function outlookDraft(d: Draft, win: Window): Promise<void> {
  try {
    win.document.title = "Outlook…"; win.document.body.innerHTML = '<p dir="rtl" style="font-family:Arial;padding:24px">⏳ מכין טיוטה ב-Outlook…</p>';
  } catch { /* already navigated */ }
  const at = await token(win);
  const H = { Authorization: "Bearer " + at, "Content-Type": "application/json" };
  const r = await fetch(G, { method: "POST", headers: H, body: JSON.stringify({ subject: d.subject, body: { contentType: "HTML", content: d.html }, toRecipients: list(d.to), ccRecipients: list(d.cc) }) });
  const m = await r.json(); if (!r.ok) throw new Error(m.error?.message || "draft " + r.status);
  for (const f of d.files || []) {
    const size = Math.floor((f.base64.length * 3) / 4) - (f.base64.endsWith("==") ? 2 : f.base64.endsWith("=") ? 1 : 0);
    if (size < 2900000) {
      const a = await fetch(G + "/" + m.id + "/attachments", { method: "POST", headers: H, body: JSON.stringify({ "@odata.type": "#microsoft.graph.fileAttachment", name: f.filename, contentType: f.type, contentBytes: f.base64 }) });
      if (!a.ok) throw new Error("attach " + f.filename + " " + a.status);
    } else {
      const us = await fetch(G + "/" + m.id + "/attachments/createUploadSession", { method: "POST", headers: H, body: JSON.stringify({ AttachmentItem: { attachmentType: "file", name: f.filename, size, contentType: f.type } }) });
      const uj = await us.json(); if (!us.ok) throw new Error("upload " + f.filename + " " + us.status);
      const bin = Uint8Array.from(atob(f.base64), (c) => c.charCodeAt(0)); const CH = 320 * 1024 * 10;
      for (let i = 0; i < bin.length; i += CH) {
        const part = bin.subarray(i, Math.min(i + CH, bin.length));
        const pr = await fetch(uj.uploadUrl, { method: "PUT", headers: { "Content-Type": "application/octet-stream", "Content-Range": "bytes " + i + "-" + (i + part.length - 1) + "/" + bin.length }, body: part });
        if (!pr.ok && pr.status !== 201 && pr.status !== 200) throw new Error("upload " + f.filename + " " + pr.status);
      }
    }
  }
  const link = m.webLink || "https://outlook.office.com/mail/drafts";
  if (viaPopup) { try { localStorage.setItem(GO, link); } catch { /* */ } }
  try { win.location.href = link; } catch { /* popup handled by GO */ }
}
