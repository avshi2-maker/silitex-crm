// format.ts (src/lib/format.ts) · updated 09.10.2026 09:10 (Asia/Jerusalem)
export function fmtDate(iso?: string | Date | null): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}
export function fmtDateTime(iso?: string | Date | null): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${fmtDate(d)} ${hh}:${mi}`;
}
export function todayIso(): string { return new Date().toISOString().slice(0, 10); }
export function addDays(iso: string, n: number): string { const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
export function fmtUsd(n: number): string { return "$" + n.toLocaleString("en-US"); }
export function fmtMoney(n: number, digits = 4): string { return "$" + n.toFixed(digits); }
export function uid(prefix = "id"): string { return prefix + "-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
