"use client";
// PotentialChart.tsx (src/components/federica/PotentialChart.tsx) · created 23.10.2026 05:30 (Asia/Jerusalem) — 📊 ONE-PICTURE management chart for Federica to forward to her bosses: estimated annual silicone volume by Israeli industry (solid = Silitex match confirmed by the scanner, light = still to scan / qualify) + 4 headline numbers. English, counts only, NO company names (Silitex distributor rule). Live from the CRM (lib/potential). 📋 copy picture (pastes into Outlook / Gmail) · ⬇ PNG · 📋 3-line caption.
import { useMemo, useRef, useState } from "react";
import { Card, btnPrimary, btnGhost } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useLang } from "@/i18n";
import { rowsOf, byIndustry, matched } from "@/lib/potential";

const W = 1200, TOP = 222, ROW = 40, LBL = 300, X0 = 330, BARMAX = 560;
const C = { ink: "#1f1d1a", sub: "#5b5953", mute: "#8a887f", grid: "#e7e5df", solid: "#E2007A", light: "#F6B3D6", surf: "#ffffff", band: "#FDF2F8" };
const r1 = (n: number) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);
const short = (s: string) => s.replace(/ & /g, " & ").replace(/\s*\(non-food\)/i, "").replace(/Formulations/i, "").trim();

export default function PotentialChart() {
  const { state, ready } = useStore(); const { t: tr } = useLang();
  const svgRef = useRef<SVGSVGElement>(null); const [msg, setMsg] = useState("");
  const d = useMemo(() => {
    const rows = rowsOf(state.leads, state.tasks); const inds = byIndustry(rows).filter((g) => g.industry && !/^(לסיווג|other|אחר)$/i.test(g.industry));
    const sorted = [...inds].sort((a, b) => b.tons - a.tons); const top = sorted.slice(0, 10); const rest = sorted.slice(10);
    if (rest.length) top.push({ industry: "Other industries (" + rest.length + ")", total: rest.reduce((s, g) => s + g.total, 0), scanned: rest.reduce((s, g) => s + g.scanned, 0), matched: rest.reduce((s, g) => s + g.matched, 0), tons: rest.reduce((s, g) => s + g.tons, 0), tonsMatched: rest.reduce((s, g) => s + g.tonsMatched, 0), a: 0, b: 0 });
    const mt = rows.filter(matched);
    const raw = Math.max(1, ...top.map((g) => g.tons)); const mag = Math.pow(10, Math.floor(Math.log10(raw / 4))); const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((x) => raw / x <= 5) || 10 * mag; const nT = Math.ceil(raw / step); // round axis, ≤ 5 steps, ends just past the longest bar
    return { bars: top, max: step * nT, step, nT, producers: rows.length, scanned: rows.filter((r) => r.scanned).length, matchedN: mt.length, tonsM: mt.reduce((s, r) => s + r.s.tons, 0), tonsAll: rows.reduce((s, r) => s + r.s.tons, 0) };
  }, [state.leads, state.tasks]);
  const H = TOP + d.bars.length * ROW + 92;
  const date = new Date().toLocaleDateString("en-GB");
  const kpis = [["Israeli producers profiled", String(d.producers)], ["Websites analysed by AI", String(d.scanned)], ["Confirmed Silitex match", String(d.matchedN)], ["Est. silicone volume, t/yr", "~" + r1(d.tonsAll)]];
  const caption = ["Silitex in Israel — market potential snapshot (" + date + ")", d.producers + " Israeli producers profiled · " + d.scanned + " websites analysed · " + d.matchedN + " with a confirmed Silitex product match.", "Estimated silicone demand ~" + r1(d.tonsAll) + " t/year (~" + r1(d.tonsM) + " t already matched to Silitex grades). Prepared by Sapirim, Silitex distributor for Israel."].join("\n");

  const toPng = async (): Promise<Blob> => {
    const svg = svgRef.current!; const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    await img.decode(); const k = 2; const cv = document.createElement("canvas"); cv.width = W * k; cv.height = H * k;
    const g = cv.getContext("2d")!; g.fillStyle = C.surf; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
    return await new Promise<Blob>((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error("png"))), "image/png"));
  };
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };
  const copyPic = async () => { try { const b = await toPng(); await navigator.clipboard.write([new ClipboardItem({ "image/png": b })]); flash(tr("✓ התמונה הועתקה — הדבק במייל (Ctrl+V)")); } catch { flash(tr("הדפדפן חסם העתקת תמונה — השתמש ב-⬇ PNG")); } };
  const download = async () => { const b = await toPng(); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "Silitex_Israel_market_potential_" + new Date().toISOString().slice(0, 10) + ".png"; a.click(); };
  const copyCap = async () => { try { await navigator.clipboard.writeText(caption); flash(tr("✓ הכיתוב הועתק")); } catch {} };

  if (!ready) return null; // browser-only (date + local data) → no hydration mismatch
  const font = "Segoe UI, Helvetica, Arial, sans-serif";
  const ticks = Array.from({ length: d.nT + 1 }, (_, i) => i * d.step);
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold flex-1">📊 {tr("גרף אחד להנהלה — פדריקה מעבירה לבוסים")}</h3>
        <button className={btnPrimary} onClick={copyPic}>📋 {tr("העתק תמונה")}</button>
        <button className={btnGhost} onClick={download}>⬇ PNG</button>
        <button className={btnGhost} onClick={copyCap}>📋 {tr("העתק כיתוב (3 שורות)")}</button>
      </div>
      {msg && <div className="text-sm text-emerald-700">{msg}</div>}
      <div className="overflow-x-auto border rounded-lg bg-white" dir="ltr">
        <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: "100%", height: "auto", display: "block" }} fontFamily={font}>
          <rect x="0" y="0" width={W} height={H} fill={C.surf} />
          <rect x="0" y="0" width={W} height="8" fill={C.solid} />
          <text x="48" y="62" fontSize="30" fontWeight="700" fill={C.ink}>Silitex in Israel — where the silicone volume is</text>
          <text x="48" y="92" fontSize="16" fill={C.sub}>Estimated annual silicone demand by industry · Israeli producers profiled and matched to the Silitex range by Sapirim · {date}</text>
          {kpis.map(([l, v], i) => (
            <g key={l} transform={`translate(${48 + i * 278},118)`}>
              <rect width="262" height="78" rx="10" fill={C.band} />
              <text x="18" y="42" fontSize="30" fontWeight="700" fill={i === 2 ? C.solid : C.ink}>{v}</text>
              <text x="18" y="64" fontSize="13" fill={C.sub}>{l}</text>
            </g>
          ))}
          {ticks.map((t, i) => { const x = X0 + (t / d.max) * BARMAX; return (<g key={i}><line x1={x} x2={x} y1={TOP - 6} y2={TOP + d.bars.length * ROW} stroke={C.grid} strokeWidth="1" /><text x={x} y={TOP + d.bars.length * ROW + 18} fontSize="12" fill={C.mute} textAnchor="middle">{r1(t)} t</text></g>); })}
          {d.bars.map((g, i) => {
            const y = TOP + i * ROW + 8, h = ROW - 16, wAll = Math.max(3, (g.tons / d.max) * BARMAX), wM = (g.tonsMatched / d.max) * BARMAX;
            return (
              <g key={g.industry}>
                <title>{g.industry}: ~{r1(g.tons)} t/yr · {g.total} producers · {g.matched} matched</title>
                <text x={LBL + 12} y={y + h / 2 + 5} fontSize="15" fill={C.ink} textAnchor="end">{short(g.industry)}</text>
                <rect x={X0} y={y} width={wAll} height={h} rx="4" fill={C.light} />
                {wM > 0.5 && <rect x={X0} y={y} width={Math.max(2, wM - 2)} height={h} rx="4" fill={C.solid} />}
                <text x={X0 + wAll + 10} y={y + h / 2 + 5} fontSize="14" fill={C.ink}><tspan fontWeight="700">~{r1(g.tons)} t</tspan><tspan fill={C.sub}>  ·  {g.total} producers · {g.matched} matched</tspan></text>
              </g>
            );
          })}
          <g transform={`translate(48,${H - 46})`}>
            <rect width="16" height="12" rx="3" fill={C.solid} /><text x="24" y="11" fontSize="13" fill={C.sub}>Silitex match confirmed by website scan</text>
            <rect x="330" width="16" height="12" rx="3" fill={C.light} /><text x="354" y="11" fontSize="13" fill={C.sub}>Still to scan / qualify</text>
            <text x="0" y="34" fontSize="12" fill={C.mute}>Volumes are estimates (by account tier) until confirmed by the customer. Company names are held by Sapirim — Silitex distributor, Israel.</text>
          </g>
        </svg>
      </div>
      <p className="text-[11px] text-slate-500">{tr("בלי שמות חברות (כלל Silitex). הנפחים — הערכה לפי Tier עד שהלקוח מאשר; מתעדכן לבד מכל סריקה.")}</p>
    </Card>
  );
}
