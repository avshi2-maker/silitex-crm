// route.ts (src/app/api/portal/indexnow/route.ts) · created 21.10.2026 11:00 (Asia/Jerusalem) — IndexNow ping (owner only, PIN gate): sends every portal URL (all 4 languages, incl. code pages + articles) to api.indexnow.org → Bing, Yandex, Seznam, Naver pick up new / changed pages within hours. Key file: public/c1fd09d4fc194588e39291364a6663dd.txt (served on www.sapirim.com/c1fd09d4fc194588e39291364a6663dd.txt).
import { NextResponse } from "next/server";
import { allPortalPaths } from "@/portal/codes";
import { PORTAL_URL, PORTAL_LANGS } from "@/portal/config";
export const runtime = "nodejs";
const INDEXNOW_KEY = "c1fd09d4fc194588e39291364a6663dd";
export async function POST() {
  const host = PORTAL_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const urlList = allPortalPaths().flatMap((p) => PORTAL_LANGS.map((l) => PORTAL_URL + "/" + l + p)).slice(0, 10000);
  try {
    const r = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: PORTAL_URL + "/" + INDEXNOW_KEY + ".txt", urlList }) });
    return NextResponse.json({ ok: r.status === 200 || r.status === 202, status: r.status, sent: urlList.length, detail: r.ok ? "" : (await r.text()).slice(0, 300) });
  } catch (e) { return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "ping failed" }, { status: 502 }); }
}
