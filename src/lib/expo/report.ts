// report.ts (src/lib/expo/report.ts) · updated 18.10.2026 12:00 (Asia/Jerusalem) — EXPO session report e-mail (server): HTML (stats · open tasks · meetings grouped by day) + plain text, labels EN / IT / HE. Values arrive already translated from the phone.
import type { ExpoMeeting, ExpoProfile } from "./store";
type L = "en" | "it" | "he";
const T: Record<L, Record<string, string>> = {
  en: { title: "Silitex Expo — session report", contacts: "Contacts", tasks: "Open tasks", done: "Done", next: "Next step", due: "Due", products: "Products", note: "Note", period: "Period", csv: "All contacts are attached as an Excel file (CSV).", none: "No open tasks.", by: "Sent from Silitex Expo" },
  it: { title: "Silitex Expo — report della sessione", contacts: "Contatti", tasks: "Attività aperte", done: "Completate", next: "Prossimo passo", due: "Scadenza", products: "Prodotti", note: "Nota", period: "Periodo", csv: "Tutti i contatti sono allegati come file Excel (CSV).", none: "Nessuna attività aperta.", by: "Inviato da Silitex Expo" },
  he: { title: "Silitex Expo — דוח מפגשים", contacts: "אנשי קשר", tasks: "משימות פתוחות", done: "בוצעו", next: "הצעד הבא", due: "תאריך יעד", products: "מוצרים", note: "הערה", period: "תקופה", csv: "כל אנשי הקשר מצורפים כקובץ Excel (CSV).", none: "אין משימות פתוחות.", by: "נשלח מ-Silitex Expo" },
};
const esc = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const br = (s: string) => esc(s).replace(/\n/g, "<br>");
const dmy = (iso: string) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "");
export function renderReport(ms: ExpoMeeting[], p: ExpoProfile, lang: string, periodLabel: string): { subject: string; html: string; text: string } {
  const l: L = lang === "it" || lang === "he" ? lang : "en"; const t = T[l]; const rtl = l === "he";
  const open = ms.filter((m) => m.next_step && !m.done).sort((a, b) => (a.due || "9").localeCompare(b.due || "9"));
  const days: Record<string, ExpoMeeting[]> = {}; for (const m of [...ms].sort((a, b) => a.at.localeCompare(b.at))) (days[m.at.slice(0, 10)] ||= []).push(m);
  const who = (p.first + " " + p.last).trim();
  const card = (m: ExpoMeeting) => "<div style='border:1px solid #e5e7eb;border-radius:10px;padding:12px;margin:8px 0'>"
    + "<div style='font-size:16px;font-weight:bold;color:#9d174d'>" + esc(m.company) + "</div>"
    + "<div style='color:#555;font-size:13px'>" + esc([m.contact_name, m.contact_role, m.industry, m.city].filter(Boolean).join(" · ")) + "</div>"
    + "<div style='color:#555;font-size:13px' dir='ltr'>" + esc([m.phone, m.email, m.website].filter(Boolean).join(" · ")) + "</div>"
    + "<div style='margin-top:6px;font-size:14px'>" + br(m.summary || m.note || "—") + "</div>"
    + (m.products.length ? "<div style='font-size:13px;color:#555;margin-top:4px'>" + t.products + ": " + esc(m.products.join(", ")) + "</div>" : "")
    + (m.next_step ? "<div style='font-size:13px;margin-top:4px'><b>" + t.next + ":</b> " + esc(m.next_step) + (m.due ? " — " + dmy(m.due) : "") + (m.done ? " ✓" : "") + "</div>" : "")
    + (m.summary && m.note ? "<div style='font-size:12px;color:#888;margin-top:4px'>" + t.note + ": " + br(m.note) + "</div>" : "") + "</div>";
  const html = "<div dir='" + (rtl ? "rtl" : "ltr") + "' style='font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111'>"
    + "<div style='background:#1f1a24;color:#fff;padding:14px 18px;border-radius:12px'><div style='font-size:18px;font-weight:bold'>" + t.title + "</div><div style='font-size:13px;opacity:.85'>" + esc(who + (p.company ? " · " + p.company : "")) + " · " + t.period + ": " + esc(periodLabel) + "</div></div>"
    + "<table style='width:100%;margin:12px 0;text-align:center'><tr><td><div style='font-size:22px;font-weight:bold'>" + ms.length + "</div><div style='font-size:12px;color:#666'>" + t.contacts + "</div></td><td><div style='font-size:22px;font-weight:bold;color:#db2777'>" + open.length + "</div><div style='font-size:12px;color:#666'>" + t.tasks + "</div></td><td><div style='font-size:22px;font-weight:bold'>" + ms.filter((m) => m.done).length + "</div><div style='font-size:12px;color:#666'>" + t.done + "</div></td></tr></table>"
    + "<h3 style='margin:16px 0 6px'>✅ " + t.tasks + "</h3>" + (open.length ? "<table style='width:100%;border-collapse:collapse;font-size:14px'>" + open.map((m) => "<tr><td style='padding:6px;border-bottom:1px solid #eee;white-space:nowrap;color:#555'>" + dmy(m.due) + "</td><td style='padding:6px;border-bottom:1px solid #eee'><b>" + esc(m.company) + "</b> — " + esc(m.next_step) + "</td></tr>").join("") + "</table>" : "<div style='color:#666'>" + t.none + "</div>")
    + Object.entries(days).map(([d, list]) => "<h3 style='margin:18px 0 4px'>📅 " + dmy(d) + " · " + list.length + "</h3>" + list.map(card).join("")).join("")
    + "<p style='font-size:12px;color:#888;margin-top:16px'>" + t.csv + "<br>" + t.by + "</p></div>";
  const text = t.title + " — " + who + " · " + periodLabel + "\n\n" + t.tasks + ":\n" + (open.map((m) => "- " + dmy(m.due) + " " + m.company + ": " + m.next_step).join("\n") || t.none) + "\n\n" + ms.map((m) => [m.company + (m.contact_name ? " — " + m.contact_name : ""), [m.phone, m.email].filter(Boolean).join(" · "), m.summary || m.note, m.next_step ? "→ " + m.next_step + " " + dmy(m.due) : ""].filter(Boolean).join("\n")).join("\n\n");
  return { subject: t.title + " · " + periodLabel + (who ? " · " + who : ""), html, text };
}
