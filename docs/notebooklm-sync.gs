// notebooklm-sync.gs · updated 27.10.2026 07:00 (Asia/Jerusalem) — v2: one Google Sheet per part (NotebookLM reads only the first tab) + Overview sheet; sheet list comes from the CRM
// Silitex CRM → Google Sheets as PLAIN VALUES → NotebookLM. Runs every hour by itself after one run of "setup".
const KEY = "3890b6e708faab73743bb69fa64dafee57eef39432da81c6";
const BASE = "https://silitex.marble-art.co.il/api/cron/notebook/";
const get = (tab, q) => UrlFetchApp.fetch(BASE + tab + "?key=" + KEY + (q || ""), { muteHttpExceptions: true }).getContentText("UTF-8");

function syncAll() {
  const map = JSON.parse(get("map"));                       // { tab: [sheetId part1, part2, ...] }
  for (const [tab, ids] of Object.entries(map)) {
    try { syncTab(tab, ids); } catch (e) { console.log(tab + " failed: " + e); }
  }
}

function syncTab(tab, ids) {
  const n = Number((get(tab, "&info=1").match(/parts,(\d+)/) || [])[1] || 1);
  if (n > ids.length) console.log(tab + ": CRM has " + n + " parts but only " + ids.length + " sheets — ask Claude to add sheets");
  ids.forEach((id, i) => {
    const ss = SpreadsheetApp.openById(id);
    ss.getSheets().slice(1).forEach((s) => s.clear());       // old extra tabs emptied (never deleted)
    const sh = ss.getSheets()[0];
    sh.clear();
    if (i >= n) { sh.getRange("A1").setValue("(spare — fills automatically when the CRM grows)"); return; }
    const rows = Utilities.parseCsv(get(tab, "&part=" + (i + 1)));
    const w = Math.max(...rows.map((r) => r.length));
    const data = rows.map((r) => r.concat(Array(w - r.length).fill("")));
    if (sh.getMaxColumns() < w) sh.insertColumnsAfter(sh.getMaxColumns(), w - sh.getMaxColumns());
    if (sh.getMaxRows() < data.length) sh.insertRowsAfter(sh.getMaxRows(), data.length - sh.getMaxRows());
    const rng = sh.getRange(1, 1, data.length, w);
    rng.setNumberFormat("@");                                  // text only: dates / phones stay as written
    rng.setValues(data);
    sh.getRange("A1").setNote("Synced from Silitex CRM " + new Date().toLocaleString("en-GB", { timeZone: "Asia/Jerusalem" }) + " · " + tab + " part " + (i + 1) + " of " + n);
  });
}

/** run ONCE: first sync + hourly auto-sync */
function setup() {
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("syncAll").timeBased().everyHours(1).create();
  syncAll();
}
