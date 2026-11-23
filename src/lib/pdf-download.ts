// pdf-download.ts (src/lib/pdf-download.ts) · updated 23.11.2026 11:50 (Asia/Jerusalem) — v1.24.0 waits for images (logos) before the snapshot · 11:20 v1.23.1 FIX squeezed PDF: snapshot always laid out at full A4 width (800px sheet, 1280px window) · 10:55 v1.23.0 💾 = "Save as" window (choose folder + name) → real PDF file · created 23.11.2026 10:30 v1.22.0
// snapshot an element (Hebrew renders as-is, it is a picture of the page) → ONE A4 portrait page, scaled down if taller.
// Save flow: the Windows "Save as" window opens FIRST (on the click), then the PDF is built and written into the file you chose.
// Browsers without the Save-as API (Firefox / Safari / phone) → the file goes to Downloads as before.
type Handle = { createWritable: () => Promise<{ write: (d: Blob | ArrayBuffer) => Promise<void>; close: () => Promise<void> }> };
type Picker = (o: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) => Promise<Handle>;

const SHEET_W = 800; // px — the A4 form width
export const safeName = (s: string) => s.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() || "document";

/** the PDF bytes of one element, one A4 portrait page */
export async function onePagePdfBlob(el: HTMLElement): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  if (el.ownerDocument.fonts?.ready) await el.ownerDocument.fonts.ready;
  await Promise.all(Array.from(el.querySelectorAll("img")).map((i) => (i.complete ? null : i.decode().catch(() => null)))); // logos loaded before the snapshot
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, windowWidth: 1280, width: SHEET_W,
    onclone: (_d, c) => { c.style.width = SHEET_W + "px"; c.style.maxWidth = "none"; c.style.minWidth = SHEET_W + "px"; c.style.boxSizing = "border-box"; } }); // never narrower than A4 (was: the frame width → the form collapsed into a strip)
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const margin = 10; const maxW = 210 - margin * 2; const maxH = 297 - margin * 2;
  const ratio = canvas.height / canvas.width;
  let w = maxW; let h = w * ratio;
  if (h > maxH) { h = maxH; w = h / ratio; } // taller than A4 → shrink so it stays on one page
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", (210 - w) / 2, margin, w, h);
  return pdf.output("blob");
}

/** "saved" = written where you chose · "downloads" = no Save-as in this browser → Downloads · "cancel" = you closed the window */
export type SaveResult = "saved" | "downloads" | "cancel";

/** MUST be called directly from the click (before any other await) — the browser only opens "Save as" on a click. */
export async function savePdfAs(name: string, make: () => Promise<Blob>): Promise<SaveResult> {
  const file = safeName(name) + ".pdf";
  const picker = (window as unknown as { showSaveFilePicker?: Picker }).showSaveFilePicker;
  if (!picker) { downloadBlob(await make(), file); return "downloads"; }
  let handle: Handle;
  try { handle = await picker.call(window, { suggestedName: file, types: [{ description: "PDF", accept: { "application/pdf": [".pdf"] } }] }); }
  catch (e) { if ((e as Error)?.name === "AbortError") return "cancel"; downloadBlob(await make(), file); return "downloads"; }
  const blob = await make(); const out = await handle.createWritable();
  await out.write(await blob.arrayBuffer()); await out.close(); return "saved";
}

export function downloadBlob(blob: Blob, file: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = file;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** kept for old callers: one click → Downloads */
export async function downloadOnePagePdf(el: HTMLElement, name: string): Promise<void> { downloadBlob(await onePagePdfBlob(el), safeName(name) + ".pdf"); }

/** build the PDF of a page that is NOT open: load it in a hidden frame, wait for its sheet ([data-pdf-sheet][data-ready]), snapshot it. */
export function pdfFromHiddenPage(src: string, timeoutMs = 20000): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const f = document.createElement("iframe");
    f.style.cssText = "position:fixed;left:-10000px;top:0;width:1280px;height:1600px;border:0;visibility:hidden";
    f.src = src; document.body.appendChild(f);
    const t0 = Date.now(); const done = () => setTimeout(() => f.remove(), 100);
    const tick = () => {
      const el = f.contentDocument?.querySelector<HTMLElement>("[data-pdf-sheet][data-ready='1']");
      if (el) { setTimeout(() => onePagePdfBlob(el).then((b) => { done(); resolve(b); }, (e) => { done(); reject(e); }), 400); return; }
      if (Date.now() - t0 > timeoutMs) { done(); reject(new Error("timeout")); return; }
      setTimeout(tick, 250);
    };
    tick();
  });
}
