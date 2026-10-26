"use client";
// page.tsx (src/app/outlook-callback/page.tsx) · created 26.10.2026 05:50 (Asia/Jerusalem)
// Microsoft sign-in comes back here (inside the popup): swap the code for the Outlook key, then the main page builds the draft here.
import { useEffect, useState } from "react";
import { finishSignIn, GO } from "@/lib/outlook-draft";
export default function OutlookCallback() {
  const [msg, setMsg] = useState("⏳ מתחבר ל-Outlook…");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search); const code = q.get("code"); const state = q.get("state") || "";
    if (!code) { setMsg("⚠ " + (q.get("error_description") || "ההתחברות נכשלה")); return; }
    finishSignIn(code, state).then(() => {
      setMsg("✓ מחובר ל-Outlook — מכין את הטיוטה…"); const t0 = Date.now();
      const tick = setInterval(() => { const go = localStorage.getItem(GO); if (go) { clearInterval(tick); localStorage.removeItem(GO); window.location.href = go; } else if (Date.now() - t0 > 120000) { clearInterval(tick); setMsg("⚠ הטיוטה לא נוצרה — חזור ל-CRM ונסה שוב"); } }, 400);
    }).catch((e) => setMsg("⚠ " + String(e?.message || e)));
  }, []);
  return <p dir="rtl" style={{ fontFamily: "Arial", padding: 24 }}>{msg}</p>;
}
