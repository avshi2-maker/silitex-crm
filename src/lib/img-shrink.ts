// img-shrink.ts (src/lib/img-shrink.ts) · created 27.10.2026 05:00 (Asia/Jerusalem) — v1.0.0
// Browser: photo → JPEG ≤1600 px (handwriting stays readable, upload stays small) → base64 for the AI.
export async function shrinkImage(file: File, max = 1600, quality = 0.82): Promise<{ data: string; type: "image/jpeg"; preview: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
    const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
    const preview = c.toDataURL("image/jpeg", quality); return { data: preview.split(",")[1], type: "image/jpeg", preview };
  } finally { URL.revokeObjectURL(url); }
}
