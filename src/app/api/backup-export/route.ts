// route.ts (src/app/api/backup-export/route.ts) · created 09.11.2026 06:30 (Asia/Jerusalem) — v1.9.4
// 💾 GET with header x-hub-wa-key = HUB_WA_KEY → the whole shared Supabase database (public schema) as gzipped JSON.
// Called weekly by the Sapirim Hub (cron /api/cron/backup), which uploads it to Avshi's Google Drive. Read-only.
import { exportAll } from "@/lib/backupExport";
export const runtime = "nodejs"; export const dynamic = "force-dynamic"; export const maxDuration = 120;
export async function GET(req: Request) {
  const k = process.env.HUB_WA_KEY;
  if (!k || req.headers.get("x-hub-wa-key") !== k) return new Response("unauthorized", { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return new Response("supabase env missing", { status: 500 });
  const { gz, tables, rows } = await exportAll(url, key, ["public"]);
  return new Response(new Uint8Array(gz), { headers: { "content-type": "application/gzip", "x-tables": String(tables), "x-rows": String(rows) } });
}
