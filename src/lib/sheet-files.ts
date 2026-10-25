// sheet-files.ts (src/lib/sheet-files.ts) · created 25.10.2026 08:25 (Asia/Jerusalem)
// Files of the 🖨️ meeting sheet, made in the browser: Excel (xlsx, RTL sheet) and PDF (A4 landscape — a picture of the sheet as it looks on screen, so Hebrew is always right).
// Libraries load only when a file is made (no weight on the page).
export type SheetFile = { blob: Blob; base64: string; filename: string };
const b64 = (buf: ArrayBuffer) => { let s = ""; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };

export async function sheetXlsx(head: string[], rows: (string | number)[][], filename: string): Promise<SheetFile> {
  const X = await import("xlsx");
  const ws = X.utils.aoa_to_sheet([head, ...rows]); ws["!cols"] = head.map((_, i) => ({ wch: [4, 32, 24, 40, 28, 60, 8, 8, 10, 10, 10, 36][i] || 14 })); (ws as Record<string, unknown>)["!views"] = [{ RTL: true }];
  const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, "Sheet");
  const buf = X.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return { blob: new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), base64: b64(buf), filename };
}

export async function sheetPdf(el: HTMLElement, filename: string): Promise<SheetFile> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, windowWidth: Math.max(1300, el.scrollWidth) });
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const m = 8, W = 297 - 2 * m, H = 210 - 2 * m; const pxPerMm = canvas.width / W; const pageH = Math.floor(H * pxPerMm);
  for (let y = 0, page = 0; y < canvas.height; y += pageH, page++) {
    const h = Math.min(pageH, canvas.height - y); const c = document.createElement("canvas"); c.width = canvas.width; c.height = h;
    const ctx = c.getContext("2d"); if (!ctx) break; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, h); ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
    if (page > 0) pdf.addPage(); pdf.addImage(c.toDataURL("image/jpeg", 0.9), "JPEG", m, m, W, h / pxPerMm);
  }
  const buf = pdf.output("arraybuffer");
  return { blob: new Blob([buf], { type: "application/pdf" }), base64: b64(buf), filename };
}

export function download(f: SheetFile) { const a = document.createElement("a"); a.href = URL.createObjectURL(f.blob); a.download = f.filename; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }

/** share sheet (phone / Windows): WhatsApp, Outlook, Mail … with the files attached. Returns false when the browser can't share files. */
export async function shareFiles(files: SheetFile[], title: string, text: string): Promise<boolean> {
  try {
    const fs = files.map((f) => new File([f.blob], f.filename, { type: f.blob.type }));
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (!nav.share || !nav.canShare || !nav.canShare({ files: fs })) return false;
    await nav.share({ files: fs, title, text }); return true;
  } catch (e) { return e instanceof DOMException && e.name === "AbortError"; }
}
