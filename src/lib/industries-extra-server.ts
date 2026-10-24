// industries-extra-server.ts (src/lib/industries-extra-server.ts) · created 24.10.2026 06:00 (Asia/Jerusalem) — server only: load the radar-added industries from Supabase into the shared list (cached 5 min) so the website scan can classify into them too.
import { serviceClient } from "./server-data";
import { setExtra, extraIndustries, type ExtraInd } from "./industries-extra";
let at = 0;
export async function loadExtraServer(): Promise<ExtraInd[]> {
  if (Date.now() - at < 300_000) return extraIndustries();
  const sb = serviceClient(); if (!sb) return extraIndustries();
  const r = await sb.from("extra_industries").select("name,who,uses").order("created_at");
  if (!r.error) { setExtra((r.data || []) as ExtraInd[]); at = Date.now(); }
  return extraIndustries();
}
