"use client";
// project-upload.ts (src/lib/project-upload.ts) · created 10.11.2026 13:50 (Asia/Jerusalem) — v1.10.0 📷 phone → Cloudinary DIRECT (signed by /api/projects/sign) → tiny request /api/projects/read
// Standing mobile flow: no long request from the phone. Photos are shrunk on the phone first; PDFs go as they are.
import type { ProjectFile, Usage } from "./types";
async function shrink(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.size < 900_000) return file;
  try { const bmp = await createImageBitmap(file); const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height)); const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k); c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height); return await new Promise<Blob>((ok) => c.toBlob((b) => ok(b || file), "image/jpeg", 0.85)); } catch { return file; }
}
export type ReadResult = { data: Record<string, string>; file: ProjectFile; usage: Usage };
export async function uploadAndRead(id: string, kind: string, file: File): Promise<ReadResult> {
  const s = await fetch("/api/projects/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, kind }) });
  const p = await s.json(); if (!s.ok) throw new Error(p.error || "sign " + s.status);
  const fd = new FormData(); fd.append("file", await shrink(file), file.name);
  for (const k of ["api_key", "timestamp", "signature", "folder", "tags"]) fd.append(k, String(p[k]));
  const up = await fetch("https://api.cloudinary.com/v1_1/" + p.cloud + "/auto/upload", { method: "POST", body: fd });
  const u = await up.json(); if (!up.ok || !u.secure_url) throw new Error(u?.error?.message || "upload " + up.status);
  const r = await fetch("/api/projects/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, kind, url: u.secure_url, name: file.name }) });
  const j = await r.json(); if (!r.ok) throw new Error(j.error || "read " + r.status); return j as ReadResult;
}
