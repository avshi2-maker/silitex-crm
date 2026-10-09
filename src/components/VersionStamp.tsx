"use client";
// VersionStamp.tsx (src/components/VersionStamp.tsx) · updated 09.10.2026 13:20 (Asia/Jerusalem) — app version · commit · build time (dd/mm/yyyy HH:MM Israel) under the clock
import { APP_VERSION } from "@/config/app";
export default function VersionStamp() {
  const sha = process.env.NEXT_PUBLIC_COMMIT || "local"; const at = process.env.NEXT_PUBLIC_BUILD_AT || "";
  const d = at ? new Date(at) : null;
  const built = d ? d.toLocaleString("en-GB", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "") : "";
  return (<div className="mt-1 text-[10px] text-slate-400 font-mono text-center" dir="ltr" title="version · commit · build time">{APP_VERSION} · {sha} · {built}</div>);
}
