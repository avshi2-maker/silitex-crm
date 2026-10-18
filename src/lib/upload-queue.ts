// upload-queue.ts (src/lib/upload-queue.ts) · updated 18.10.2026 06:50 (Asia/Jerusalem) — client only. Field captures (photo / audio / video / note) are stored on the phone (IndexedDB) and uploaded DIRECTLY to Cloudinary (signed by /api/field/sign) whenever there is signal. Nothing is processed on the phone.
export type QItem = { id: string; meeting_id: string; label: string; lead_id: string; kind: "card" | "photo" | "audio" | "video" | "note"; blob: Blob; name: string; at: string; tries: number; err?: string };
const DB = "silitex-field", STORE = "uploads";
function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
}
async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db(); return new Promise((res, rej) => { const t = d.transaction(STORE, mode); const rq = fn(t.objectStore(STORE)); rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); });
}
export const listQueue = () => tx<QItem[]>("readonly", (s) => s.getAll() as IDBRequest<QItem[]>);
export const putItem = (it: QItem) => tx("readwrite", (s) => s.put(it));
const delItem = (id: string) => tx("readwrite", (s) => s.delete(id));
export async function enqueueCapture(it: Omit<QItem, "id" | "at" | "tries">): Promise<void> {
  await putItem({ ...it, id: "up-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), at: new Date().toISOString(), tries: 0 });
}
let running = false;
/** uploads everything waiting; returns how many are still waiting */
export async function flushUploads(onProgress?: (left: number) => void): Promise<number> {
  if (running || (typeof navigator !== "undefined" && !navigator.onLine)) return (await listQueue()).length;
  running = true;
  try {
    const q = (await listQueue()).sort((a, b) => a.at.localeCompare(b.at));
    for (const it of q) {
      try {
        const s = await fetch("/api/field/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meeting_id: it.meeting_id, label: it.label, lead_id: it.lead_id, kind: it.kind }) });
        const p = await s.json(); if (!s.ok) throw new Error(p.error || "sign " + s.status);
        const fd = new FormData(); fd.append("file", it.blob, it.name);
        for (const k of ["api_key", "timestamp", "signature", "folder", "tags", "context"]) fd.append(k, String(p[k]));
        const up = await fetch("https://api.cloudinary.com/v1_1/" + p.cloud + "/" + (it.kind === "note" ? "raw" : "auto") + "/upload", { method: "POST", body: fd });
        const j = await up.json(); if (!up.ok || !j.secure_url) throw new Error(j?.error?.message || "upload " + up.status);
        await delItem(it.id);
      } catch (e) { await putItem({ ...it, tries: it.tries + 1, err: e instanceof Error ? e.message : "error" }); if (!navigator.onLine) break; }
      onProgress?.((await listQueue()).length);
    }
  } finally { running = false; }
  return (await listQueue()).length;
}
