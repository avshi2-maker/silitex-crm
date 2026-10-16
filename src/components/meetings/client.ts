// client.ts (src/components/meetings/client.ts) · updated 16.10.2026 18:40 · English task titles (Asia/Jerusalem) — browser helpers for /meetings: transcript file reader (.txt / .vtt / .docx), VTT cleanup, CRM-task bridge
import type { MeetingAction } from "@/lib/meeting-types";
import type { Task } from "@/lib/types";
import { addDays, fmtDate } from "@/lib/format";
/** Teams .vtt → "Name: text" lines */
export function cleanVtt(s: string): string {
  if (!/^WEBVTT/.test(s.trim())) return s;
  return s.split(/\r?\n/).filter((l) => l.trim() && !/^WEBVTT|^\d+$|-->|^NOTE\b|^[0-9a-f-]{20,}(\/\d+-\d+)?$/i.test(l.trim())).map((l) => l.replace(/<v ([^>]+)>(.*?)(<\/v>)?$/, "$1: $2")).join("\n");
}
export async function readTranscriptFile(f: File): Promise<string> {
  const n = f.name.toLowerCase();
  if (n.endsWith(".docx")) {
    const mammoth = await import("mammoth/mammoth.browser");
    const r = await mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() });
    return r.value;
  }
  return cleanVtt(await f.text());
}
/** Sapirim action → CRM task (kind "meeting", shows on dashboard / schedule) */
export function actionTask(a: Pick<MeetingAction, "task" | "due">, heldAt: string): Omit<Task, "id" | "done"> {
  return { lead_id: "silitex", lead_name: "Silitex", title: "Silitex meeting " + fmtDate(heldAt) + " — " + a.task, due: a.due || addDays(new Date().toISOString(), 7), cadence: "once", kind: "meeting" };
}
