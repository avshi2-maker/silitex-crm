// pdf-download.ts (src/lib/pdf-download.ts) · created 23.11.2026 10:30 (Asia/Jerusalem) — v1.22.0 💾 one-click PDF download:
// snapshot an element (Hebrew renders as-is, it is a picture of the page) → ONE A4 portrait page, scaled down if taller → browser downloads "<name>.pdf".
// No print window, no "Save as". Loaded on demand so the libraries only download when the button is clicked.

export async function downloadOnePagePdf(el: HTMLElement, name: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  if (document.fonts?.ready) await document.fonts.ready;
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, windowWidth: el.scrollWidth });
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const margin = 10; const maxW = 210 - margin * 2; const maxH = 297 - margin * 2;
  const ratio = canvas.height / canvas.width;
  let w = maxW; let h = w * ratio;
  if (h > maxH) { h = maxH; w = h / ratio; } // taller than A4 → shrink so it stays on one page
  const x = (210 - w) / 2;
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", x, margin, w, h);
  pdf.save(safeName(name) + ".pdf");
}

export const safeName = (s: string) => s.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() || "document";
