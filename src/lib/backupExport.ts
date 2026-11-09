// backupExport.ts (src/lib/backupExport.ts) · created 09.11.2026 06:30 (Asia/Jerusalem) — v1.9.4
// 💾 Weekly backup source for the Sapirim Hub → Google Drive: the WHOLE shared database (public schema) as one gzipped JSON. Read-only.
import { gzipSync } from "zlib";

/** every table (and view) of the given schemas → one gzipped JSON {created, counts, data:{schema:{table:rows}}} (read-only) */
export async function exportAll(url: string, key: string, schemas: string[] = ["public"]): Promise<{ gz: Buffer; tables: number; rows: number }> {
  const out: { created: string; counts: Record<string, number>; data: Record<string, Record<string, unknown[]>> } = { created: new Date().toISOString(), counts: {}, data: {} };
  let tables = 0, rows = 0;
  for (const sc of schemas) {
    const h = { apikey: key, authorization: "Bearer " + key, "accept-profile": sc, accept: "application/json" };
    const spec = (await (await fetch(url.replace(/\/$/, "") + "/rest/v1/", { headers: { ...h, accept: "application/openapi+json" }, cache: "no-store" })).json()) as { definitions?: Record<string, unknown> };
    out.data[sc] = {};
    for (const t of Object.keys(spec.definitions || {}).filter((n) => !n.startsWith("rpc")).sort()) {
      const all: unknown[] = [];
      for (let off = 0; off < 200000; off += 1000) {
        const r = await fetch(url.replace(/\/$/, "") + "/rest/v1/" + encodeURIComponent(t) + "?select=*&limit=1000&offset=" + off, { headers: h, cache: "no-store" });
        if (!r.ok) break;
        const b = (await r.json()) as unknown[]; if (!Array.isArray(b)) break;
        all.push(...b); if (b.length < 1000) break;
      }
      out.data[sc][t] = all; out.counts[sc + "." + t] = all.length; tables++; rows += all.length;
    }
  }
  return { gz: gzipSync(Buffer.from(JSON.stringify(out))), tables, rows };
}
